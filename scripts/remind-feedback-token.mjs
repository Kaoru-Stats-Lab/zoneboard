/**
 * Open an ops Issue when GITHUB_FEEDBACK_TOKEN is within remindDaysBefore of expiry.
 * Dates: docs/ops/feedback-token.json. No token values.
 */
import { readFileSync } from "node:fs";

const cfg = JSON.parse(
  readFileSync(new URL("../docs/ops/feedback-token.json", import.meta.url), "utf8"),
);

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) {
  console.error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");
  process.exit(1);
}

const expires = Date.parse(`${cfg.expires}T00:00:00Z`);
if (Number.isNaN(expires)) {
  console.error(`bad expires: ${cfg.expires}`);
  process.exit(1);
}

const now = new Date();
const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const daysLeft = Math.ceil((expires - todayUtc) / 86_400_000);
const window = Number(cfg.remindDaysBefore) || 14;

console.log(
  `${cfg.secret} expires ${cfg.expires} (${daysLeft} day(s) left; remind at ${window})`,
);

if (daysLeft > window) {
  process.exit(0);
}

const titlePrefix = `[ops] Rotate ${cfg.secret}`;
const title = `${titlePrefix} by ${cfg.expires}`;
const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "zoneboard-feedback-token-reminder",
};

const listUrl = `https://api.github.com/repos/${repo}/issues?state=open&per_page=100`;
const listed = await fetch(listUrl, { headers });
if (!listed.ok) {
  console.error(`list issues failed: ${listed.status} ${await listed.text()}`);
  process.exit(1);
}

const open = await listed.json();
const existing = open.find(
  (issue) =>
    !issue.pull_request &&
    typeof issue.title === "string" &&
    issue.title.startsWith(titlePrefix),
);
if (existing) {
  console.log(`already open: #${existing.number}`);
  process.exit(0);
}

const when =
  daysLeft < 0
    ? `Expired ${-daysLeft} day(s) ago.`
    : daysLeft === 0
      ? "Expires today."
      : `${daysLeft} day(s) left.`;

const body = [
  when,
  "",
  `Rotate \`${cfg.secret}\` (fine-grained PAT, Issues R/W, this repo only).`,
  "Do not paste the token here.",
  "",
  "Steps: docs/FEEDBACK.md",
  "After rotating: update docs/ops/feedback-token.json dates, refresh the ICS, close this issue.",
].join("\n");

const created = await fetch(`https://api.github.com/repos/${repo}/issues`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ title, body }),
});
if (!created.ok) {
  console.error(`create issue failed: ${created.status} ${await created.text()}`);
  process.exit(1);
}

const issue = await created.json();
console.log(`opened #${issue.number}`);
