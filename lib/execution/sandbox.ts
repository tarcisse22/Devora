/**
 * App-side client for the sandboxed code runner (public/sandbox/runner.html).
 *
 * The runner lives in a hidden <iframe sandbox="allow-scripts"> — an opaque
 * origin with no access to Devora's cookies, storage or DOM. One iframe is
 * shared for the whole session so the Python runtime only loads once.
 */

export type RunLanguage = "javascript" | "python";
export type OutputStream = "stdout" | "stderr" | "warn" | "info" | "system";

export type TraceStep = {
  line: number;
  vars: Record<string, string>;
  stack: string[];
  /** How many console lines had been printed when this step ran. */
  outputLength: number;
};

export type RunResult = {
  ok: boolean;
  /** Runner-level failure (timeout, stop, runtime load error). */
  error?: string;
  durationMs?: number;
  steps?: TraceStep[];
};

type RunOptions = {
  language: RunLanguage;
  code: string;
  timeoutMs?: number;
  mode?: "run" | "trace";
  onOutput?: (stream: OutputStream, text: string) => void;
  onStatus?: (text: string) => void;
};

type Pending = RunOptions & { resolve: (r: RunResult) => void; steps?: TraceStep[] };

const RUNNER_URL = "/sandbox/runner.html";

class SandboxClient {
  private iframe: HTMLIFrameElement | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<string, Pending>();
  private counter = 0;

  private ensure(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.setAttribute("aria-hidden", "true");
      iframe.title = "Devora code runner";
      iframe.tabIndex = -1;
      iframe.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;";
      iframe.src = RUNNER_URL;

      const timeout = window.setTimeout(() => {
        this.reset();
        reject(new Error("The code runner did not start."));
      }, 15000);

      const onMessage = (e: MessageEvent) => {
        // Only trust messages from our own runner frame.
        if (!this.iframe || e.source !== this.iframe.contentWindow) return;
        const msg = e.data ?? {};
        if (msg.type === "ready") {
          window.clearTimeout(timeout);
          resolve();
          return;
        }
        const job = this.pending.get(msg.id);
        if (!job) return;
        if (msg.type === "output") job.onOutput?.(msg.stream, String(msg.text));
        else if (msg.type === "status") job.onStatus?.(String(msg.text));
        else if (msg.type === "trace") job.steps = msg.steps;
        else if (msg.type === "done") {
          this.pending.delete(msg.id);
          job.resolve({ ok: Boolean(msg.ok), error: msg.error, durationMs: msg.durationMs, steps: job.steps });
        }
      };
      window.addEventListener("message", onMessage);
      this.iframe = iframe;
      document.body.appendChild(iframe);
    });
    return this.ready;
  }

  private reset() {
    this.iframe?.remove();
    this.iframe = null;
    this.ready = null;
  }

  /** Run code. Resolves when the program finishes, errors, times out or is stopped. */
  async run(options: RunOptions): Promise<{ id: string; result: Promise<RunResult> }> {
    await this.ensure();
    const id = `run-${++this.counter}`;
    const result = new Promise<RunResult>((resolve) => this.pending.set(id, { ...options, resolve }));
    this.iframe!.contentWindow!.postMessage(
      {
        type: "run",
        id,
        language: options.language,
        code: options.code,
        timeoutMs: options.timeoutMs ?? 5000,
        mode: options.mode ?? "run",
      },
      "*", // the runner has an opaque origin, so "*" is the only valid target
    );
    return { id, result };
  }

  stop(id: string) {
    this.iframe?.contentWindow?.postMessage({ type: "stop", id }, "*");
  }
}

let client: SandboxClient | null = null;

/** Shared sandbox client (browser only). */
export function getSandbox(): SandboxClient {
  if (typeof window === "undefined") throw new Error("The sandbox is only available in the browser.");
  client ??= new SandboxClient();
  return client;
}
