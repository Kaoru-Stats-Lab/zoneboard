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
  updatedAt: "2026-08-31",
  /** One-line policy shown on /updates */
  policyEn:
    "Shipped changes only, in past tense. Upcoming work stays off this page.",
  entries: [
    {
      id: "optional-name-pills-20260831",
      date: "2026-08-31",
      type: "feature",
      title: "Optional name pills on the pitch",
      body: "Turn starter name pills on or off in the Match tab. Bench players always show a name chip so your XI line stays readable when names are off. New boards default to numbers only; older saves keep names on.",
    },
    {
      id: "portrait-pitch-pitch-view-20260831",
      date: "2026-08-31",
      type: "feature",
      title: "Portrait pitch and Pitch View picker",
      body: "Soccer boards can use a portrait pitch with goals top and bottom — separate data from landscape, not a coordinate map. The Match tab Pitch View row is five icons for landscape and portrait full and half. Switching landscape ↔ portrait resets every scene to an empty pitch with a centred ball. Match banner stays off in portrait.",
    },
    {
      id: "export-scene-fixes-20260828",
      date: "2026-08-28",
      type: "improve",
      title: "Clearer PNG export and swap-end behaviour",
      body: "Pitch-only PNG export no longer draws chrome around the board. When you swap ends, scenes rotate 180° instead of mirroring. Broadcast framing keeps a 16:9 island with black matte on wider windows.",
    },
    {
      id: "scene-duplicate-review-sheet-20260828",
      date: "2026-08-28",
      type: "feature",
      title: "Duplicate scenes, review notes, and a shortcut sheet",
      body: "Duplicate a scene from the Scenes drawer to try a pattern and switch back. Each scene can carry a short review note. A printable shortcut sheet lives under Materials and in the how-to footer.",
    },
    {
      id: "space-drag-view-pan-20260828",
      date: "2026-08-28",
      type: "feature",
      title: "Pan the pitch with Space+drag",
      body: "Hold Space and drag to move the camera on a zoomed pitch. Release Space to place pieces again. The shortcut sheet lists Space+drag.",
    },
    {
      id: "link-tool-ja-menus-20260827",
      date: "2026-08-27",
      type: "feature",
      title: "Link tool, kit colours, and Japanese board menus",
      body: "The Link tool draws ink paths between pieces. Kit colours accept full HEX values. Board chrome can follow Japanese when you choose 日本語 in Settings; landing and reading pages stay English. New boards can open on an in-progress tactical moment instead of a blank line-up.",
    },
    {
      id: "free-pro-plan-foundation-20260827",
      date: "2026-08-27",
      type: "feature",
      title: "Free and Pro plan foundation",
      body: "Pricing pages now describe Free and Pro tiers. Pro is a local library entitlement on your device — not a cloud account. Checkout is not live yet; the board stays usable without signing in.",
    },
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
