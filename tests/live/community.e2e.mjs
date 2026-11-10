/**
 * End-to-end browser test against the real Firebase project.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run test:e2e                # in another
 *
 * Two throwaway users (@example.com) sign up through the UI, choose
 * usernames, post, reply, like, moderate, sync progress to a second
 * "device", then delete their accounts through the Account page. Their
 * username claims are removed at the end so the project stays clean.
 */
import { createRequire } from "node:module";
// Resolved via require() so a globally installed Playwright also works.
const { chromium } = createRequire(import.meta.url)("playwright");
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, doc, getDoc, getFirestore } from "firebase/firestore";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SCREENSHOTS_DIR;
const run = Date.now().toString(36);
const fail = [];
const ok = (c, m) => (c ? console.log("  ✓", m) : (fail.push(m), console.log("  ✗", m)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const users = {
  alice: { email: `devora-e2e-alice-${run}@example.com`, password: `E2e-${run}-Alice!`, username: `e2e_a_${run}`.slice(0, 20), name: "Alice Test" },
  bob: { email: `devora-e2e-bob-${run}@example.com`, password: `E2e-${run}-Bob!`, username: `e2e_b_${run}`.slice(0, 20), name: "Bob Test" },
};

// Behind an HTTPS proxy (e.g. CI or a sandbox), send only external traffic
// through it; the local app is reached directly.
const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } } : {});
const newContext = () => browser.newContext({ viewport: { width: 1360, height: 960 }, ignoreHTTPSErrors: Boolean(process.env.HTTPS_PROXY) });
const errors = [];
let expectBadPassword = false;
const watch = (page, who) => {
  page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
  page.on("console", (m) => {
    // Resource failures are checked by URL below; permission-denied logs
    // from the Firestore SDK are expected in negative tests.
    if (m.type() === "error" && !/PERMISSION_DENIED|permission-denied|Failed to load resource/i.test(m.text())) errors.push(`${who}: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() < 400) return;
    const url = r.url().split("?")[0];
    // The deliberate wrong-password attempt returns 400 from Firebase Auth.
    if (expectBadPassword && url.endsWith("accounts:signInWithPassword") && r.status() === 400) return;
    errors.push(`${who}: HTTP ${r.status()} ${url}`);
  });
};

async function signUp(page, u) {
  await page.goto(`${BASE}/sign-in?mode=create`);
  await page.fill('input[type="email"]', u.email);
  await page.fill('input[type="password"]', u.password);
  await page.click('button[type="submit"]:has-text("Create account")');
  await page.waitForURL("**/account/setup**", { timeout: 30000 });
  await page.fill('input[autocomplete="username"]', u.username);
  await page.fill('input[autocomplete="name"]', u.name);
  await page.click('button:has-text("Continue")');
  await page.waitForURL("**/community", { timeout: 30000 });
}

let threadUrl;
const aliceCtx = await newContext();
const alice = await aliceCtx.newPage();
watch(alice, "alice");
const bobCtx = await newContext();
const bob = await bobCtx.newPage();
watch(bob, "bob");

try {
  /* ----------------------------------------------- local progress, then sign up */
  await alice.goto(`${BASE}/learn/algorithms/binary-search`);
  await alice.click('button:has-text("Mark as complete")');
  ok(await alice.isVisible('button:has-text("Completed")'), "alice marks a lesson complete before having an account");

  await signUp(alice, users.alice);
  ok(true, "alice signs up and chooses a username through the UI");
  await alice.waitForSelector(`button[aria-label^="Account menu for ${users.alice.name}"]`, { timeout: 15000 });
  ok(true, "navbar shows alice's account menu");

  /* ------------------------------------------------------------ duplicate username */
  await signUp(bob, { ...users.bob, username: users.alice.username }).catch(() => {});
  ok((await bob.textContent("form")).includes("already taken"), "bob can’t take alice’s username");
  await bob.fill('input[autocomplete="username"]', users.bob.username);
  await bob.click('button:has-text("Continue")');
  await bob.waitForURL("**/community", { timeout: 30000 });
  ok(true, "bob picks a free username");

  /* ------------------------------------------------------------- post a thread */
  await alice.click('a:has-text("New thread")');
  await alice.waitForURL("**/community/new");
  await alice.click('label:has-text("Shared projects")');
  await alice.fill('input[placeholder^="Be specific"]', `E2E test thread ${run}`);
  await alice.fill("textarea", "Automated end-to-end test.\n\n```\nconst answer = 42;\n```\n\nIt will be deleted.");
  await alice.fill('input[type="url"]', "https://example.com/project");
  await alice.click('button:has-text("Post thread")');
  await alice.waitForURL("**/community/t/**", { timeout: 30000 });
  threadUrl = alice.url();
  await alice.waitForSelector(`h1:has-text("E2E test thread ${run}")`);
  ok(await alice.isVisible("pre:has-text('const answer = 42;')"), "thread posted, code block rendered");
  ok((await alice.getAttribute('a[href="https://example.com/project"]', "rel")).includes("nofollow"), "user links are rel=nofollow ugc");
  if (SHOTS) await alice.screenshot({ path: `${SHOTS}/e2e-thread.png` });

  await alice.goto(`${BASE}/community/new`);
  ok((await alice.textContent("form")).includes("You can post again in"), "posting cooldown is shown");

  /* ------------------------------------------------------------- edit */
  await alice.goto(threadUrl);
  await alice.click('button:has-text("Edit")');
  await alice.fill('input[aria-label="Title"]', `E2E test thread ${run} (edited)`);
  await alice.click('button:has-text("Save changes")');
  await alice.waitForSelector(`h1:has-text("(edited)")`, { timeout: 15000 });
  ok(true, "alice edits her thread");

  /* ------------------------------------------------------------- bob interacts */
  await bob.goto(threadUrl);
  await bob.waitForSelector(`h1:has-text("(edited)")`);
  ok(!(await bob.isVisible('button:has-text("Edit")')), "bob sees no edit controls on alice’s thread");
  await bob.click('button[aria-pressed]:has-text("like")');
  await bob.waitForSelector('button[aria-pressed="true"]:has-text("1 like")', { timeout: 15000 });
  ok(true, "bob likes the thread");
  await bob.fill('textarea[placeholder^="Write a reply"]', "Nice work! Here's a tip: `use const`.");
  await bob.click('button:has-text("Reply")');
  await bob.waitForSelector("text=Nice work!", { timeout: 15000 });
  ok(true, "bob replies");
  ok((await bob.textContent('section[aria-label="Replies"]')).includes("You can reply again in"), "reply cooldown is shown");

  // Alice sees it live, without reloading.
  await alice.waitForSelector("text=Nice work!", { timeout: 15000 });
  ok((await alice.textContent("article")).includes("1 like"), "alice sees bob’s reply and like live");
  if (SHOTS) await alice.screenshot({ path: `${SHOTS}/e2e-live.png` });

  // Alice moderates bob's reply.
  alice.once("dialog", (d) => d.accept());
  await alice.click('button[aria-label="Delete reply"]');
  await alice.waitForSelector("text=Nice work!", { state: "detached", timeout: 15000 });
  ok(true, "thread author removes a reply");

  /* ------------------------------------------------------------- list & profile */
  await bob.goto(`${BASE}/community`);
  await bob.waitForSelector(`a:has-text("E2E test thread ${run} (edited)")`, { timeout: 15000 });
  ok(true, "thread appears in the community list");
  await bob.click('[role="tab"]:has-text("Questions")');
  ok(!(await bob.isVisible(`a:has-text("E2E test thread ${run}")`)), "category filter hides it under Questions");
  await bob.click('[role="tab"]:has-text("Shared projects")');
  ok(await bob.isVisible(`a:has-text("E2E test thread ${run}")`), "and shows it under Shared projects");
  await bob.goto(`${BASE}/community/u/${users.alice.username}`);
  await bob.waitForSelector(`h1:has-text("${users.alice.name}")`, { timeout: 15000 });
  ok((await bob.textContent("main")).includes(`E2E test thread ${run}`), "alice’s profile lists her thread");

  /* ------------------------------------------------------------- progress sync */
  await sleep(2000);
  const device2Ctx = await newContext();
  const device2 = await device2Ctx.newPage();
  watch(device2, "alice-device2");
  await device2.goto(`${BASE}/sign-in`);
  await device2.fill('input[type="email"]', users.alice.email);
  await device2.fill('input[type="password"]', users.alice.password);
  await device2.click('button[type="submit"]:has-text("Sign in")');
  await device2.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 30000 });
  await device2.goto(`${BASE}/learn/algorithms/binary-search`);
  await device2.waitForSelector('button:has-text("Completed")', { timeout: 20000 });
  ok(true, "progress made before sign-up appears on a second device");
  await device2.goto(`${BASE}/learn/algorithms/sorting`);
  await device2.click('button:has-text("Mark as complete")');
  await alice.goto(`${BASE}/learn/algorithms/sorting`);
  await alice.waitForSelector('button:has-text("Completed")', { timeout: 20000 });
  ok(true, "progress from device 2 syncs back to device 1");
  await device2Ctx.close();

  /* ------------------------------------------------------------- sign out / in */
  await bob.click(`button[aria-label^="Account menu"]`);
  await bob.click('[role="menuitem"]:has-text("Sign out")');
  await bob.waitForSelector('a:has-text("Sign In")', { timeout: 15000 });
  ok(true, "bob signs out");
  await bob.goto(threadUrl);
  ok((await bob.textContent('section[aria-label="Replies"]')).includes("to reply"), "signed-out visitors can read but must sign in to reply");
  await bob.goto(`${BASE}/sign-in`);
  await bob.fill('input[type="email"]', users.bob.email);
  await bob.fill('input[type="password"]', "wrong-password");
  expectBadPassword = true;
  await bob.click('button[type="submit"]:has-text("Sign in")');
  await bob.waitForSelector("text=Email or password is incorrect", { timeout: 15000 });
  ok(true, "wrong password shows a clear error");
  expectBadPassword = false;

  /* ------------------------------------------------------------- delete thread */
  await alice.goto(threadUrl);
  alice.once("dialog", (d) => d.accept());
  await alice.click('button:has-text("Delete")');
  await alice.waitForURL("**/community", { timeout: 20000 });
  await bob.goto(threadUrl);
  await bob.waitForSelector("text=This thread doesn’t exist", { timeout: 15000 });
  ok(true, "alice deletes her thread; it’s gone for everyone");
} catch (e) {
  fail.push(`flow stopped: ${e.message.split("\n")[0]}`);
  console.log("  ✗ flow stopped:", e.message.split("\n")[0]);
  if (SHOTS) await alice.screenshot({ path: `${SHOTS}/e2e-failure-alice.png` }).catch(() => {});
  if (SHOTS) await bob.screenshot({ path: `${SHOTS}/e2e-failure-bob.png` }).catch(() => {});
}

/* ------------------------------------------------- cleanup: delete accounts */
const app = initializeApp({ apiKey: "AIzaSyDyyzOoww7MCm4d_m3nIXn09Nu0UdKfmSg", authDomain: "devora-62b2a.firebaseapp.com", projectId: "devora-62b2a" }, `cleanup-${run}`);
for (const [who, u] of Object.entries(users)) {
  const page = who === "alice" ? alice : bob;
  try {
    // Remove the reserved username first (only possible while the account exists).
    const auth = getAuth(app);
    const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
    const db = getFirestore(app);
    if ((await getDoc(doc(db, "usernames", u.username))).data()?.uid === cred.user.uid) await deleteDoc(doc(db, "usernames", u.username));
    await auth.signOut();

    // Then delete the account through the real Account page.
    await page.goto(`${BASE}/sign-in?next=/account`);
    if (page.url().includes("/sign-in")) {
      await page.fill('input[type="email"]', u.email);
      await page.fill('input[type="password"]', u.password);
      await page.click('button[type="submit"]:has-text("Sign in")');
    }
    await page.waitForURL("**/account", { timeout: 30000 });
    await page.click('button:has-text("Delete my account")');
    await page.fill('input[aria-label="Password"]', u.password);
    await page.click('button:has-text("Delete forever")');
    await page.waitForURL((url) => url.pathname === "/", { timeout: 30000 });
    // Signing in must now fail.
    const gone = await signInWithEmailAndPassword(getAuth(app), u.email, u.password).then(
      () => false,
      () => true,
    );
    ok(gone, `${who}’s account is deleted through the Account page`);
  } catch (e) {
    fail.push(`cleanup ${who}: ${e.message.split("\n")[0]}`);
    console.log(`  ✗ cleanup ${who}:`, e.message.split("\n")[0]);
  }
}
await deleteApp(app);
await browser.close();

console.log("\nconsole/page errors:", errors.length ? errors : "none");
if (errors.length) fail.push("console errors");
console.log(fail.length ? `\n${fail.length} FAILED` : "\nALL LIVE E2E CHECKS PASSED");
process.exit(fail.length ? 1 : 0);
