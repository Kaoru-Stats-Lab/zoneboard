/**
 * Public shipped changelog (SUGUDASU-style).
 * Only past-tense, user-facing changes. No roadmap / no internal tickets.
 * Edit here → `npm run site:pages` writes `/updates/`.
 */
export type ChangelogType = "feature" | "fix" | "improve";

export type ChangelogEntry = {
  id: string;
  date: string;
  type: ChangelogType;
  title: string;
  body: string;
};

export const CHANGELOG = {
  updatedAt: "2026-08-26",
  /** One-line policy shown on /updates */
  policyEn:
    "Shipped changes only, in past tense. Upcoming work stays off this page.",
  entries: [
    {
      id: "live-match-undo-pk-goal-20260826",
      date: "2026-08-26",
      type: "feature",
      title: "Live match undo and PK goal labels",
      body: "You can undo or delete a recent goal, card, or sub from the live controls when a name is mistyped. Penalty goals can be tagged so the match banner shows PK before the scorer.",
    },
    {
      id: "broadcast-subs-pk-strip-20260826",
      date: "2026-08-26",
      type: "feature",
      title: "Broadcast sub marks and PK shootout strip",
      body: "OUT, IN, and injured states show on pieces. A penalty shootout strip lives on the match banner for viewers. Closing the PK input keeps results on the banner. Sub caps are not counted in the product.",
    },
    {
      id: "png-framing-copy-20260826",
      date: "2026-08-26",
      type: "improve",
      title: "Clearer PNG post framing labels",
      body: "Post framing “full field” means the camera zooms out. Portrait formats still crop the pitch. Use 16:9 or Pitch ratio when you need the whole field in the frame.",
    },
    {
      id: "png-credit-share-ogp-20260826",
      date: "2026-08-26",
      type: "feature",
      title: "Optional PNG credit, share blurb, and OGP image",
      body: "Settings can add a small zoneboard.app line under a social PNG (off by default, never on live capture). Materials includes a stream description blurb. Public pages ship full Open Graph and Twitter cards.",
    },
  ] satisfies ChangelogEntry[],
} as const;

export function publicChangelogEntries(): ChangelogEntry[] {
  return [...CHANGELOG.entries].sort((a, b) =>
    a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date),
  );
}
