import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BrandLockup } from "./BrandMark";

type Props = {
  kicker: string;
  title: string;
  copy: string;
  primary: { to: string; label: string };
  secondary?: { to: string; label: string };
  onPrimary?: () => void;
};

export function StudioStatus({
  kicker,
  title,
  copy,
  primary,
  secondary,
  onPrimary,
}: Props) {
  return (
    <div className="zb-status">
      <p className="zb-status__brand">
        <BrandLockup
          className="zb-status__lockup"
          markClassName="zb-status__mark"
          word="ZoneBoard"
          scheme="color"
          on="dark"
        />
      </p>
      <p className="zb-status__kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="zb-status__copy">{copy}</p>
      <p className="zb-status__actions">
        {onPrimary ? (
          <button
            type="button"
            className="zb-status__btn zb-status__btn--primary"
            onClick={onPrimary}
          >
            {primary.label}
          </button>
        ) : (
          <Link className="zb-status__btn zb-status__btn--primary" to={primary.to}>
            {primary.label}
          </Link>
        )}
        {secondary ? (
          <Link className="zb-status__btn" to={secondary.to}>
            {secondary.label}
          </Link>
        ) : null}
      </p>
    </div>
  );
}

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found — ZoneBoard";
  }, []);
  return (
    <StudioStatus
      kicker="404"
      title="This page is not here"
      copy="The address is wrong, or the page has moved. The tactics board is still on this site."
      primary={{ to: "/board", label: "Open board" }}
      secondary={{ to: "/", label: "Home" }}
    />
  );
}
