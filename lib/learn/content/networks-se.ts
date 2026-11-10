import type { Subject } from "../types";

export const networksSubject: Subject = {
  slug: "computer-networks",
  name: "Computer Networks",
  description: "How data travels between machines, from packets to the web.",
  lessons: [
    {
      slug: "network-layers",
      title: "Network Layers",
      summary: "Splitting networking into layers that each solve one problem.",
      blocks: [
        { type: "p", text: "Networking is divided into **layers**. Each layer offers a service to the one above and relies on the one below, so you can change one (Wi-Fi to Ethernet) without rewriting the others. The internet uses the **TCP/IP model**:" },
        { type: "diagram", caption: "The TCP/IP layers", text: "Application   HTTP, DNS, SMTP        ← what your program speaks\nTransport     TCP, UDP               ← process-to-process, ports\nInternet      IP                     ← host-to-host, addresses & routing\nLink          Ethernet, Wi-Fi        ← one hop on the local network" },
        { type: "p", text: "When you send data, each layer **encapsulates** it by adding its own header: the HTTP request becomes the payload of a TCP segment, which becomes the payload of an IP packet, which is carried in an Ethernet or Wi-Fi frame. The receiver strips the headers in reverse order." },
        { type: "list", items: ["**IP addresses** identify hosts (e.g. `192.0.2.10`, or IPv6 `2001:db8::1`).", "**Ports** identify a program on a host (443 for HTTPS, 53 for DNS).", "**Routers** forward IP packets hop by hop towards their destination."] },
      ],
      quiz: [
        { question: "Which layer is responsible for routing packets between networks?", options: ["Application", "Transport", "Internet (IP)", "Link"], answer: 2, explanation: "IP handles addressing and routing across networks." },
        { question: "What identifies a specific program on a host?", options: ["MAC address", "Port number", "Domain name", "Subnet mask"], answer: 1, explanation: "The transport layer uses ports to deliver data to the right process." },
      ],
      related: [{ label: "TCP and UDP", href: "/learn/computer-networks/tcp-and-udp" }],
    },
    {
      slug: "tcp-and-udp",
      title: "TCP and UDP",
      summary: "Reliable streams versus fast datagrams.",
      blocks: [
        { type: "p", text: "**TCP** provides a reliable, ordered byte stream. It starts with a **three-way handshake** (SYN, SYN-ACK, ACK), numbers every byte, retransmits lost segments and slows down when the network is congested." },
        { type: "diagram", caption: "The TCP three-way handshake", text: "Client                      Server\n  │ ── SYN ─────────────────► │\n  │ ◄──────────── SYN-ACK ─── │\n  │ ── ACK ─────────────────► │\n  │      connection open      │" },
        { type: "p", text: "**UDP** just sends independent **datagrams**: no handshake, no ordering, no retransmission. It has less overhead and latency, which suits real-time audio, video and games — where a late packet is useless anyway — and simple request/response protocols like DNS." },
        { type: "list", items: ["Use **TCP** when every byte must arrive in order: web pages, file transfer, email.", "Use **UDP** when speed matters more than perfect delivery: calls, live streams, gaming.", "**QUIC** (used by HTTP/3) builds reliability on top of UDP to avoid some of TCP’s delays."] },
      ],
      quiz: [
        { question: "Which protocol guarantees in-order delivery?", options: ["UDP", "TCP", "IP", "Both TCP and UDP"], answer: 1, explanation: "TCP sequences and retransmits data; UDP doesn’t." },
        { question: "Why do video calls often use UDP?", options: ["It encrypts data", "Low latency matters more than retransmitting late packets", "It is required by browsers", "It guarantees delivery"], answer: 1, explanation: "Waiting for a retransmitted frame would make the call lag." },
      ],
      related: [{ label: "HTTP and DNS", href: "/learn/computer-networks/http-and-dns" }],
    },
    {
      slug: "http-and-dns",
      title: "HTTP and DNS",
      summary: "What happens when you type a URL and press Enter.",
      blocks: [
        { type: "p", text: "Visiting `https://example.com/about` triggers a chain of steps across every layer:" },
        {
          type: "list",
          ordered: true,
          items: [
            "**DNS lookup:** the browser asks a DNS resolver for the IP address of `example.com` (results are cached).",
            "**Connection:** it opens a connection to that IP on port 443 (TCP + TLS, or QUIC for HTTP/3).",
            "**TLS:** the server proves its identity with a certificate and both sides agree on encryption keys.",
            "**HTTP request:** the browser sends `GET /about` with headers.",
            "**HTTP response:** the server replies with a status code, headers and a body (HTML).",
            "**Rendering:** the browser parses the HTML and requests CSS, JavaScript and images — repeating the process.",
          ],
        },
        {
          type: "code",
          language: "text",
          caption: "A raw HTTP request and response",
          code: `GET /about HTTP/1.1
Host: example.com
Accept: text/html

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: max-age=3600

<!doctype html>…`,
        },
        { type: "list", items: ["**2xx** success (200 OK, 201 Created, 204 No Content)", "**3xx** redirection (301 Moved Permanently, 304 Not Modified)", "**4xx** client errors (400 Bad Request, 401 Unauthorized, 404 Not Found)", "**5xx** server errors (500 Internal Server Error, 503 Service Unavailable)"] },
        { type: "callout", tone: "tip", text: "HTTP is **stateless**: each request stands alone. Cookies and tokens are how servers recognise that requests come from the same user — see the Authentication System project." },
      ],
      quiz: [
        { question: "What does DNS do?", options: ["Encrypts traffic", "Translates domain names into IP addresses", "Renders HTML", "Assigns port numbers"], answer: 1, explanation: "DNS is the internet’s phone book." },
        { question: "A server responds 404. What does it mean?", options: ["Server crashed", "Resource not found", "Redirect", "Success with no content"], answer: 1, explanation: "4xx codes are client errors; 404 means the resource doesn’t exist." },
      ],
      related: [{ label: "Project: REST API", href: "/projects/rest-api" }],
    },
  ],
};

export const softwareEngineeringSubject: Subject = {
  slug: "software-engineering",
  name: "Software Engineering",
  description: "Practices for building software that works, lasts and can be changed safely by a team.",
  lessons: [
    {
      slug: "version-control-with-git",
      title: "Version Control with Git",
      summary: "Tracking changes, branching and collaborating safely.",
      blocks: [
        { type: "p", text: "**Git** records snapshots of your project called **commits**. Each commit has a message, an author and a pointer to its parent, forming a history you can inspect, compare and roll back." },
        {
          type: "code",
          language: "text",
          caption: "The everyday loop",
          code: `git status                 # what changed?
git add src/app.js         # stage a change
git commit -m "Add login form validation"
git switch -c feature/search   # new branch
git push -u origin feature/search`,
        },
        { type: "p", text: "A **branch** is a movable pointer to a commit. Teams develop features on branches and merge them through **pull requests**, where changes are reviewed and tested before reaching the main branch." },
        { type: "list", items: ["Commit small, focused changes with messages that explain **why**.", "Pull often to stay close to the main branch and avoid large conflicts.", "Never commit secrets (API keys, passwords); use environment variables and a `.gitignore`."] },
        { type: "callout", tone: "warning", text: "Rewriting shared history (force-pushing a branch others use) can destroy teammates’ work. Rewrite only your own, unshared branches." },
      ],
      quiz: [
        { question: "What is a Git branch?", options: ["A copy of the whole repository", "A movable pointer to a commit", "A backup on a server", "A folder"], answer: 1, explanation: "Branches are lightweight pointers, which is why creating them is instant." },
        { question: "Where should API keys go?", options: ["In the code, committed", "In a README", "In environment variables, never committed", "In commit messages"], answer: 2, explanation: "Secrets in Git history are effectively public." },
      ],
      related: [{ label: "Testing", href: "/learn/software-engineering/testing" }],
    },
    {
      slug: "testing",
      title: "Testing",
      summary: "Automated checks that let you change code with confidence.",
      blocks: [
        { type: "p", text: "Automated tests run your code with known inputs and check the outputs. They catch regressions — bugs reintroduced by later changes — before users do." },
        { type: "list", items: ["**Unit tests** check one function or class in isolation. Fast and numerous.", "**Integration tests** check that pieces work together (an API with a real database).", "**End-to-end tests** drive the whole app like a user would. Slow, so keep them for critical flows."] },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          caption: "A tiny test runner — the idea behind every testing framework",
          code: `function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const cases = [
  ["Hello World", "hello-world"],
  ["  Trim me  ", "trim-me"],
  ["C++ & Rust!", "c-rust"],
];

for (const [input, expected] of cases) {
  const actual = slugify(input);
  console.log(actual === expected ? "PASS" : "FAIL", JSON.stringify(input), "→", actual);
}`,
        },
        { type: "callout", tone: "tip", text: "Test behaviour, not implementation details: a good test still passes after a refactor that doesn’t change behaviour. Devora’s Practice challenges work exactly like this — hidden tests check what your function returns, not how." },
      ],
      quiz: [
        { question: "Which tests are fastest and most numerous?", options: ["End-to-end", "Integration", "Unit", "Manual"], answer: 2, explanation: "Unit tests run in isolation and in milliseconds." },
        { question: "What is a regression?", options: ["A new feature", "A previously working behaviour that broke", "A performance improvement", "A failing build server"], answer: 1, explanation: "Tests guard against regressions when code changes." },
      ],
      related: [
        { label: "Practice challenges", href: "/practice" },
        { label: "Writing maintainable code", href: "/learn/software-engineering/maintainable-code" },
      ],
    },
    {
      slug: "maintainable-code",
      title: "Writing Maintainable Code",
      summary: "Code is read far more often than it is written.",
      blocks: [
        { type: "p", text: "Most of a codebase’s life is spent being read and changed. Maintainable code makes that cheap: it is easy to understand, easy to change and hard to misuse." },
        { type: "list", items: ["**Name things precisely:** `unpaidInvoices` beats `list2`.", "**Keep functions small** and focused on one job.", "**Avoid duplication** — but don’t abstract until you see the pattern a few times.", "**Handle errors explicitly** instead of failing silently.", "**Write comments that explain why**, not what the code already says."] },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          caption: "Before and after: same behaviour, clearer intent",
          code: `// Before
function f(a) {
  let t = 0;
  for (let i = 0; i < a.length; i++) if (a[i].s === "p") t += a[i].v;
  return t;
}

// After
function totalPaid(invoices) {
  return invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}

const invoices = [
  { status: "paid", amount: 120, s: "p", v: 120 },
  { status: "open", amount: 80, s: "o", v: 80 },
];
console.log(f(invoices), totalPaid(invoices)); // 120 120`,
        },
        { type: "callout", tone: "note", text: "Code review is where these habits spread: reviewers check correctness, readability and tests, and authors keep pull requests small enough to review well." },
      ],
      quiz: [
        { question: "What should a good comment explain?", options: ["What each line does", "Why the code is written this way", "Who wrote it", "Nothing — never comment"], answer: 1, explanation: "The code shows what; comments add the reasoning the code can’t express." },
        { question: "Which name is most maintainable for a list of overdue tasks?", options: ["list", "data2", "overdueTasks", "x"], answer: 2, explanation: "Precise names make code self-explanatory." },
      ],
      related: [{ label: "Project: Full-Stack Application", href: "/projects/full-stack-app" }],
    },
  ],
};
