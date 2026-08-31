/** Product Hunt — ZoneBoard for OBS (Scheduled 2026-09-01 16:01 JST). */
export const PRODUCT_HUNT = {
  url: "https://www.producthunt.com/products/zoneboard-for-obs",
  productId: "1301976",
  followBadgeSrc:
    "https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=1301976&theme=dark&size=small",
  followHref:
    "https://www.producthunt.com/products/zoneboard-for-obs?utm_source=badge-follow&utm_medium=badge&utm_campaign=badge-zoneboard-for-obs",
} as const;

/** Launch day 00:00 JST through end of launch week. */
const LAUNCH_VISIBLE_FROM = Date.parse("2026-09-01T00:00:00+09:00");
const LAUNCH_VISIBLE_UNTIL = Date.parse("2026-09-07T23:59:59+09:00");

export function isProductHuntLaunchVisible(now = Date.now()): boolean {
  return now >= LAUNCH_VISIBLE_FROM && now <= LAUNCH_VISIBLE_UNTIL;
}
