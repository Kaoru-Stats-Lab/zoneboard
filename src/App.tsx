import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Editor } from "./components/Editor";
import { FeedbackProvider } from "./components/FeedbackProvider";
import { Landing } from "./components/Landing";
import { useAppState } from "./hooks/useAppState";
import type { Locale } from "./i18n/messages";
import { loadPrefs, savePrefs } from "./storage/persist";
import { useMemo, useState } from "react";

function detectLocale(): Locale {
  const prefs = loadPrefs();
  if (prefs.locale === "ja" || prefs.locale === "en") return prefs.locale;
  return "en";
}

function BoardRoute() {
  const { locale: localeParam } = useParams();
  const navigate = useNavigate();
  const locale: Locale = localeParam === "en" ? "en" : "ja";
  const state = useAppState();

  const onLocale = (l: Locale) => {
    savePrefs({ ...loadPrefs(), locale: l });
    navigate(`/${l}/board`, { replace: true });
  };

  return (
    <FeedbackProvider>
      <Editor state={state} locale={locale} onLocale={onLocale} />
    </FeedbackProvider>
  );
}

function LandingRoute() {
  const { locale: localeParam } = useParams();
  const locale: Locale = localeParam === "en" ? "en" : "ja";
  return (
    <FeedbackProvider>
      <Landing locale={locale} boardPath={`/${locale}/board`} />
    </FeedbackProvider>
  );
}

export default function App() {
  const [defaultLocale] = useState(detectLocale);

  const rootRedirect = useMemo(
    () => <Navigate to={`/${defaultLocale}`} replace />,
    [defaultLocale],
  );

  return (
    <Routes>
      <Route path="/" element={rootRedirect} />
      <Route path="/:locale" element={<LandingRoute />} />
      <Route path="/:locale/board" element={<BoardRoute />} />
      <Route path="*" element={rootRedirect} />
    </Routes>
  );
}
