type Props = {
  className?: string;
  title?: string;
};

/** Canonical ZB mark: Z from formation dots + 57° stroke. Brass first marker. */
export function BrandMark({ className, title }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width="32"
      height="32"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <rect width="32" height="32" rx="6" fill="#0c0d0e" />
      <line
        x1="22.5"
        y1="9.5"
        x2="9.5"
        y2="22.5"
        stroke="#f3f3f1"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9" r="2.45" fill="#f3f3f1" />
      <circle cx="16" cy="9" r="2.45" fill="#f3f3f1" />
      <circle cx="23" cy="9" r="2.45" fill="#f3f3f1" />
      <circle cx="9" cy="23" r="2.45" fill="#f3f3f1" />
      <circle cx="16" cy="23" r="2.45" fill="#f3f3f1" />
      <circle cx="23" cy="23" r="2.45" fill="#c4a24a" />
    </svg>
  );
}
