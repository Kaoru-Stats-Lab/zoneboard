import { bootConsentBanner } from "../lib/consent";
import { initAnalytics, sendPageView } from "../lib/ga";

const banner = document.getElementById("site-consent");
if (banner) bootConsentBanner(banner);

initAnalytics();
sendPageView();
