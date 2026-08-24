import {
  MARK,
  type MarkGround,
  type MarkScheme,
  type MarkVariant,
  resolveMarkPaint,
} from "../brand/mark";

type MarkProps = {
  className?: string;
  title?: string;
  variant?: MarkVariant;
  scheme?: MarkScheme;
  /** Ground behind the mark. For `icon`, this is the tile colour. */
  on?: MarkGround;
};

/** Canonical ZB mark: Z from formation dots + 57° stroke. Brass first marker. */
export function BrandMark({
  className,
  title,
  variant = "icon",
  scheme = "color",
  on = "dark",
}: MarkProps) {
  const isMark = variant === "mark";
  const paint = resolveMarkPaint({ variant, scheme, on });
  return (
    <svg
      className={className}
      viewBox={isMark ? MARK.viewBoxMark : MARK.viewBoxIcon}
      width="32"
      height="32"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {paint.plate ? (
        <rect width="32" height="32" rx="6" fill={paint.plate} />
      ) : null}
      <line
        x1="22.5"
        y1="9.5"
        x2="9.5"
        y2="22.5"
        stroke={paint.ink}
        strokeWidth={MARK.stroke}
        strokeLinecap="round"
      />
      {MARK.dots.map(([cx, cy], i) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={MARK.r}
          fill={i === MARK.first ? paint.accent : paint.ink}
        />
      ))}
    </svg>
  );
}

type LockupProps = {
  className?: string;
  markClassName?: string;
  word: string;
  variant?: MarkVariant;
  scheme?: MarkScheme;
  on?: MarkGround;
};

export function BrandLockup({
  className,
  markClassName,
  word,
  variant = "mark",
  scheme = "color",
  on = "dark",
}: LockupProps) {
  return (
    <span className={className}>
      <BrandMark
        className={markClassName}
        variant={variant}
        scheme={scheme}
        on={on}
      />
      {word}
    </span>
  );
}
