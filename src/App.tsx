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
import { useAppState } from "./hooks/useAppState";

function BoardRoute() {
  const state = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const bootBroadcast = useRef(false);
  const { enterBroadcast } = state;

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
    <FeedbackProvider>
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
        <Route path="/en" element={<Navigate to="/" replace />} />
        <Route path="/en/board" element={<Navigate to="/board" replace />} />
        <Route path="/ja" element={<Navigate to="/" replace />} />
        <Route path="/ja/board" element={<Navigate to="/board" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppErrorBoundary>
  );
}
