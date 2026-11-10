/**
 * Live security-rule tests against the real Firebase project.
 *
 *   npm run test:live
 *
 * Creates two throwaway accounts (@example.com, never verified), exercises
 * what Devora's users can and cannot do, then deletes everything it created.
 * Requires network access to Firebase and the rules in firestore.rules to be
 * published on the project.
 */
import { initializeApp, deleteApp } from "firebase/app";
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from "firebase/auth";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const config = {
  apiKey: "AIzaSyDyyzOoww7MCm4d_m3nIXn09Nu0UdKfmSg",
  authDomain: "devora-62b2a.firebaseapp.com",
  projectId: "devora-62b2a",
  appId: "1:718377626828:web:4763b9aaf46cbad88aa669",
};

const results = [];
const run = Date.now().toString(36);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function expectAllowed(name, fn) {
  try {
    await fn();
    results.push(["PASS", name]);
  } catch (e) {
    results.push(["FAIL", `${name} — expected allowed, got ${e.code ?? e.message}`]);
  }
}
async function expectDenied(name, fn) {
  try {
    await fn();
    results.push(["FAIL", `${name} — expected DENIED, but it was allowed`]);
  } catch (e) {
    results.push([e.code === "permission-denied" ? "PASS" : "FAIL", `${name}${e.code === "permission-denied" ? "" : ` — unexpected ${e.code ?? e.message}`}`]);
  }
}

/** One signed-in client per user (separate Firebase app instances). */
async function newUser(label) {
  const app = initializeApp(config, `${label}-${run}`);
  const auth = getAuth(app);
  const email = `devora-rules-${label}-${run}@example.com`;
  const cred = await createUserWithEmailAndPassword(auth, email, `Rules-${run}-${label}-pw!`);
  return { app, auth, db: getFirestore(app), uid: cred.user.uid, user: cred.user, username: `t_${label}_${run}`.slice(0, 20) };
}

async function createProfile(u, username = u.username) {
  const b = writeBatch(u.db);
  b.set(doc(u.db, "usernames", username), { uid: u.uid });
  b.set(doc(u.db, "users", u.uid), { username, displayName: `Test ${u.uid.slice(0, 4)}`, bio: "", createdAt: serverTimestamp(), lastPostAt: Timestamp.fromMillis(0) });
  await b.commit();
}

async function postThread(u, data = {}) {
  const ref = doc(collection(u.db, "threads"));
  const b = writeBatch(u.db);
  b.set(ref, {
    authorId: u.uid,
    authorUsername: u.username,
    category: "discussion",
    title: "Rules test thread",
    body: "Automated security-rule test. This will be deleted.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  });
  b.update(doc(u.db, "users", u.uid), { lastPostAt: serverTimestamp() });
  await b.commit();
  return ref.id;
}

async function postReply(u, threadId, data = {}) {
  const ref = doc(collection(u.db, "threads", threadId, "replies"));
  const b = writeBatch(u.db);
  b.set(ref, { authorId: u.uid, authorUsername: u.username, body: "Test reply", createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...data });
  b.update(doc(u.db, "users", u.uid), { lastPostAt: serverTimestamp() });
  await b.commit();
  return ref.id;
}

const anonApp = initializeApp(config, `anon-${run}`);
const anonDb = getFirestore(anonApp);
let alice, bob;
const createdThreads = [];

try {
  alice = await newUser("alice");
  bob = await newUser("bob");

  /* ------------------------------------------------------------ profiles */
  await expectDenied("profile with someone else's uid", () => setDoc(doc(alice.db, "users", bob.uid), { username: "x_hijack", displayName: "x", bio: "", createdAt: serverTimestamp(), lastPostAt: Timestamp.fromMillis(0) }));
  await expectDenied("profile without claiming the username", () => setDoc(doc(alice.db, "users", alice.uid), { username: alice.username, displayName: "A", bio: "", createdAt: serverTimestamp(), lastPostAt: Timestamp.fromMillis(0) }));
  await expectDenied("invalid username (uppercase)", () => createProfile(alice, "Bad_Name"));
  await expectAllowed("alice creates her profile", () => createProfile(alice));
  await expectDenied("bob claims alice's username", () => createProfile(bob, alice.username));
  await expectAllowed("bob creates his profile", () => createProfile(bob));
  await expectAllowed("anyone can read profiles", () => getDoc(doc(anonDb, "users", alice.uid)));
  await expectDenied("alice changes her username", () => updateDoc(doc(alice.db, "users", alice.uid), { username: "renamed_x" }));
  await expectAllowed("alice edits her display name and bio", () => updateDoc(doc(alice.db, "users", alice.uid), { displayName: "Alice", bio: "Learning graphs" }));
  await expectDenied("bob edits alice's profile", () => updateDoc(doc(bob.db, "users", alice.uid), { bio: "hacked" }));
  await expectDenied("bio longer than 280 characters", () => updateDoc(doc(alice.db, "users", alice.uid), { bio: "x".repeat(281) }));
  await expectDenied("bob deletes alice's username claim", () => deleteDoc(doc(bob.db, "usernames", alice.username)));

  /* ------------------------------------------------------------ progress */
  const progress = { lessons: ["algorithms/binary-search"], challenges: ["two-sum"], projectItems: ["task-manager:0"], updatedAt: serverTimestamp() };
  await expectAllowed("alice saves her progress", () => setDoc(doc(alice.db, "progress", alice.uid), progress));
  await expectAllowed("alice reads her progress", () => getDoc(doc(alice.db, "progress", alice.uid)));
  await expectDenied("bob reads alice's progress", () => getDoc(doc(bob.db, "progress", alice.uid)));
  await expectDenied("anonymous reads alice's progress", () => getDoc(doc(anonDb, "progress", alice.uid)));
  await expectDenied("bob overwrites alice's progress", () => setDoc(doc(bob.db, "progress", alice.uid), progress));
  await expectDenied("progress with unexpected fields", () => setDoc(doc(alice.db, "progress", alice.uid), { ...progress, admin: true }));

  /* ------------------------------------------------------------- threads */
  await expectDenied("anonymous posts a thread", () => setDoc(doc(collection(anonDb, "threads")), { authorId: "x", authorUsername: "x", category: "discussion", title: "Spam spam", body: "x", createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await expectDenied("thread impersonating bob", () => postThread(alice, { authorId: bob.uid, authorUsername: bob.username }));
  await expectDenied("thread with a fake username", () => postThread(alice, { authorUsername: bob.username }));
  await expectDenied("thread with an invalid category", () => postThread(alice, { category: "announcements" }));
  await expectDenied("thread title too short", () => postThread(alice, { title: "Hi" }));
  await expectDenied("thread with a javascript: link", () => postThread(alice, { link: "javascript:alert(1)" }));
  await expectDenied("thread without updating the rate-limit clock", () => setDoc(doc(collection(alice.db, "threads")), { authorId: alice.uid, authorUsername: alice.username, category: "discussion", title: "No cooldown", body: "x", createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  let threadId;
  await expectAllowed("alice posts a thread", async () => {
    threadId = await postThread(alice, { category: "project", link: "https://example.com/demo" });
    createdThreads.push([alice, threadId]);
  });
  await expectDenied("alice posts again immediately (30 s cooldown)", () => postThread(alice));
  await expectAllowed("anyone can read threads", () => getDoc(doc(anonDb, "threads", threadId)));
  await expectAllowed("alice edits her thread", () => updateDoc(doc(alice.db, "threads", threadId), { title: "Rules test thread (edited)", updatedAt: serverTimestamp() }));
  await expectDenied("alice changes the thread's author", () => updateDoc(doc(alice.db, "threads", threadId), { authorId: bob.uid, updatedAt: serverTimestamp() }));
  await expectDenied("bob edits alice's thread", () => updateDoc(doc(bob.db, "threads", threadId), { title: "Hijacked title", updatedAt: serverTimestamp() }));
  await expectDenied("bob deletes alice's thread", () => deleteDoc(doc(bob.db, "threads", threadId)));

  /* ------------------------------------------------------------- replies */
  let bobReply;
  await expectAllowed("bob replies", async () => (bobReply = await postReply(bob, threadId)));
  await expectDenied("bob replies again immediately (10 s cooldown)", () => postReply(bob, threadId));
  await expectDenied("reply impersonating alice", () => postReply(bob, threadId, { authorId: alice.uid, authorUsername: alice.username }));
  await expectDenied("reply to a thread that doesn't exist", async () => {
    await sleep(11000);
    await postReply(bob, `missing-${run}`);
  });
  await expectDenied("alice edits bob's reply", () => updateDoc(doc(alice.db, "threads", threadId, "replies", bobReply), { body: "edited by alice", updatedAt: serverTimestamp() }));
  await expectAllowed("bob edits his reply", () => updateDoc(doc(bob.db, "threads", threadId, "replies", bobReply), { body: "Edited reply", updatedAt: serverTimestamp() }));
  await expectDenied("reply longer than 5000 characters", () => updateDoc(doc(bob.db, "threads", threadId, "replies", bobReply), { body: "x".repeat(5001), updatedAt: serverTimestamp() }));

  /* --------------------------------------------------------------- likes */
  await expectAllowed("bob likes the thread", () => setDoc(doc(bob.db, "threads", threadId, "likes", bob.uid), { createdAt: serverTimestamp() }));
  await expectDenied("bob likes on alice's behalf", () => setDoc(doc(bob.db, "threads", threadId, "likes", alice.uid), { createdAt: serverTimestamp() }));
  await expectAllowed("bob unlikes", () => deleteDoc(doc(bob.db, "threads", threadId, "likes", bob.uid)));

  /* -------------------------------------------------------- moderation */
  await expectAllowed("thread author removes a reply in her thread", () => deleteDoc(doc(alice.db, "threads", threadId, "replies", bobReply)));
  await expectAllowed("alice deletes her thread", async () => {
    await deleteDoc(doc(alice.db, "threads", threadId));
    createdThreads.length = 0;
  });
} catch (e) {
  results.push(["FAIL", `setup error: ${e.code ?? e.message}`]);
} finally {
  // Clean up everything this run created.
  for (const [u, id] of createdThreads) {
    for (const sub of ["replies", "likes"]) {
      const snap = await getDocs(collection(u.db, "threads", id, sub)).catch(() => null);
      for (const d of snap?.docs ?? []) await deleteDoc(d.ref).catch(() => {});
    }
    await deleteDoc(doc(u.db, "threads", id)).catch(() => {});
  }
  for (const u of [alice, bob].filter(Boolean)) {
    await deleteDoc(doc(u.db, "progress", u.uid)).catch(() => {});
    await deleteDoc(doc(u.db, "usernames", u.username)).catch(() => {});
    await deleteDoc(doc(u.db, "users", u.uid)).catch(() => {});
    await deleteUser(u.user).catch(() => {});
    await signOut(u.auth).catch(() => {});
    await deleteApp(u.app);
  }
  await deleteApp(anonApp);
}

const failed = results.filter(([s]) => s === "FAIL");
for (const [s, name] of results) console.log(`${s === "PASS" ? "  ✓" : "  ✗"} ${name}`);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
