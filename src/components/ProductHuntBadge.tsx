import { PRODUCT_HUNT } from "../site/productHunt";

type Props = {
  className?: string;
};

/** PH Follow badge — footer only; small dark 86×32. */
export function ProductHuntFollowBadge({ className }: Props) {
  return (
    <a
      href={PRODUCT_HUNT.followHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <img
        src={PRODUCT_HUNT.followBadgeSrc}
        alt="ZoneBoard for OBS on Product Hunt"
        width={86}
        height={32}
      />
    </a>
  );
}
