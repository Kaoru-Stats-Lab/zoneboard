import { Navigate, Route, Routes } from "react-router-dom";
import { Editor } from "./components/Editor";
import { FeedbackProvider } from "./components/FeedbackProvider";
import { Landing } from "./components/Landing";
import { useAppState } from "./hooks/useAppState";

function BoardRoute() {
  const state = useAppState();
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
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/board" element={<BoardRoute />} />
      <Route path="/en" element={<Navigate to="/" replace />} />
      <Route path="/en/board" element={<Navigate to="/board" replace />} />
      <Route path="/ja" element={<Navigate to="/" replace />} />
      <Route path="/ja/board" element={<Navigate to="/board" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
