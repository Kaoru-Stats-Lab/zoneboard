import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, isSpaTrackedPath, sendPageView } from "../lib/ga";

export function AnalyticsRoot() {
  const location = useLocation();

  useEffect(() => {
    if (!isSpaTrackedPath(location.pathname)) return;
    initAnalytics();
    sendPageView();
  }, [location.pathname, location.search]);

  return null;
}
