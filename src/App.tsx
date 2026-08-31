import { useEffect, useRef } from "react";
import {
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { Editor } from "./components/Editor";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AnalyticsRoot } from "./components/AnalyticsRoot";
import { FeedbackProvider } from "./components/FeedbackProvider";
import { Landing } from "./components/Landing";
import { NotFoundPage } from "./components/StudioStatus";
import { FrameExtractPage } from "./pages/FrameExtractPage";
import { useAppState } from "./hooks/useAppState";
import { localeFromSearchParam } from "./i18n/locale";
import { isCaptureImportEnabled } from "./lib/captureImportGate";

function BoardRoute() {
  const state = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const bootBroadcast = useRef(false);
  const bootLang = useRef(false);
  const bootNew = useRef(false);
  const { enterBroadcast, setLocale, requestNewBoard } = state;

  useEffect(() => {
    if (bootLang.current) return;
    const fromQuery = localeFromSearchParam(searchParams.get("lang"));
    if (!fromQuery) return;
    bootLang.current = true;
    setLocale(fromQuery);
    const next = new URLSearchParams(searchParams);
    next.delete("lang");
    setSearchParams(next, { replace: true });
  }, [searchParams, setLocale, setSearchParams]);

  useEffect(() => {
    if (bootNew.current) return;
    if (searchParams.get("new") !== "1") return;
    bootNew.current = true;
    requestNewBoard({ replaceOldestIfFull: true });
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, requestNewBoard]);

  useEffect(() => {
    const wantsBroadcast =
      searchParams.get("broadcast") === "1" ||
      searchParams.get("capture") === "1";
    if (!wantsBroadcast) return;

    if (!bootBroadcast.current) {
      bootBroadcast.current = true;
      enterBroadcast();
    }

    if (
      searchParams.get("capture") === "1" ||
      searchParams.get("broadcast") !== "1"
    ) {
      const next = new URLSearchParams(searchParams);
      next.delete("capture");
      next.set("broadcast", "1");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, enterBroadcast]);

  return (
    <FeedbackProvider locale={state.locale}>
      <Editor state={state} />
    </FeedbackProvider>
  );
}

function LandingRoute() {
  return (
    <FeedbackProvider>
      <Landing />
    </FeedbackProvider>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AnalyticsRoot />
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/board" element={<BoardRoute />} />
        <Route path="/board/" element={<BoardRoute />} />
        <Route
          path="/tools/frame"
          element={
            isCaptureImportEnabled() ? (
              <FrameExtractPage />
            ) : (
              <Navigate to="/board" replace />
            )
          }
        />
        <Route
          path="/tools/frame/"
          element={
            isCaptureImportEnabled() ? (
              <FrameExtractPage />
            ) : (
              <Navigate to="/board" replace />
            )
          }
        />
        <Route path="/en" element={<Navigate to="/" replace />} />
        <Route path="/en/" element={<Navigate to="/" replace />} />
        <Route path="/en/board" element={<Navigate to="/board" replace />} />
        <Route path="/en/board/" element={<Navigate to="/board" replace />} />
        <Route path="/ja" element={<Navigate to="/" replace />} />
        <Route path="/ja/" element={<Navigate to="/" replace />} />
        <Route
          path="/ja/board"
          element={<Navigate to="/board?lang=ja" replace />}
        />
        <Route
          path="/ja/board/"
          element={<Navigate to="/board?lang=ja" replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppErrorBoundary>
  );
}
