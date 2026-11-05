import { useEffect, useRef } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { Editor } from "./components/Editor";
import { FilesDashboard } from "./components/FilesDashboard";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AnalyticsRoot } from "./components/AnalyticsRoot";
import { FeedbackProvider } from "./components/FeedbackProvider";
import { Landing } from "./components/Landing";
import { NotFoundPage } from "./components/NotFoundPage";
import { FrameExtractPage } from "./pages/FrameExtractPage";
import { AppStateProvider, useAppStateContext } from "./hooks/AppStateContext";
import { FileLibraryProvider } from "./hooks/FileLibraryContext";
import { localeFromSearchParam } from "./i18n/locale";
import type { Locale } from "./i18n/messages";
import { isCaptureImportEnabled } from "./lib/captureImportGate";

/**
 * Shared BoardStore + File Session + in-memory file library for
 * `/board` and `/files` so File Session and file list survive navigation.
 */
function WorkspaceLayout() {
  return (
    <AppStateProvider>
      <FileLibraryProvider>
        <Outlet />
      </FileLibraryProvider>
    </AppStateProvider>
  );
}

function BoardRoute() {
  const state = useAppStateContext();
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

function FilesRoute() {
  const state = useAppStateContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const bootLang = useRef(false);

  useEffect(() => {
    if (bootLang.current) return;
    const fromQuery = localeFromSearchParam(searchParams.get("lang"));
    if (!fromQuery) return;
    bootLang.current = true;
    state.setLocale(fromQuery);
    const next = new URLSearchParams(searchParams);
    next.delete("lang");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, state]);

  return (
    <FeedbackProvider locale={state.locale}>
      <FilesDashboard />
    </FeedbackProvider>
  );
}

function LandingRoute({ locale }: { locale?: Locale }) {
  return (
    <FeedbackProvider locale={locale}>
      <Landing locale={locale} />
    </FeedbackProvider>
  );
}

function localeBoardRedirect(lang: Locale) {
  return <Navigate to={`/board?lang=${lang}`} replace />;
}

function localeFilesRedirect(lang: Locale) {
  return <Navigate to={`/files?lang=${lang}`} replace />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AnalyticsRoot />
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route element={<WorkspaceLayout />}>
          <Route path="/board" element={<BoardRoute />} />
          <Route path="/board/" element={<BoardRoute />} />
          <Route path="/files" element={<FilesRoute />} />
          <Route path="/files/" element={<FilesRoute />} />
        </Route>
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
        <Route path="/en/files" element={<Navigate to="/files" replace />} />
        <Route path="/en/files/" element={<Navigate to="/files" replace />} />
        <Route path="/ja" element={<Navigate to="/ja/" replace />} />
        <Route path="/ja/" element={<LandingRoute locale="ja" />} />
        <Route path="/ja/board" element={localeBoardRedirect("ja")} />
        <Route path="/ja/board/" element={localeBoardRedirect("ja")} />
        <Route path="/ja/files" element={localeFilesRedirect("ja")} />
        <Route path="/ja/files/" element={localeFilesRedirect("ja")} />
        <Route path="/es/" element={<LandingRoute locale="es" />} />
        <Route path="/es" element={<Navigate to="/es/" replace />} />
        <Route path="/es/board" element={localeBoardRedirect("es")} />
        <Route path="/es/board/" element={localeBoardRedirect("es")} />
        <Route path="/es/files" element={localeFilesRedirect("es")} />
        <Route path="/es/files/" element={localeFilesRedirect("es")} />
        <Route path="/pt/" element={<LandingRoute locale="pt" />} />
        <Route path="/pt" element={<Navigate to="/pt/" replace />} />
        <Route path="/pt/board" element={localeBoardRedirect("pt")} />
        <Route path="/pt/board/" element={localeBoardRedirect("pt")} />
        <Route path="/pt/files" element={localeFilesRedirect("pt")} />
        <Route path="/pt/files/" element={localeFilesRedirect("pt")} />
        <Route path="/pl/" element={<LandingRoute locale="pl" />} />
        <Route path="/pl" element={<Navigate to="/pl/" replace />} />
        <Route path="/pl/board" element={localeBoardRedirect("pl")} />
        <Route path="/pl/board/" element={localeBoardRedirect("pl")} />
        <Route path="/pl/files" element={localeFilesRedirect("pl")} />
        <Route path="/pl/files/" element={localeFilesRedirect("pl")} />
        <Route path="/de/" element={<LandingRoute locale="de" />} />
        <Route path="/de" element={<Navigate to="/de/" replace />} />
        <Route path="/de/board" element={localeBoardRedirect("de")} />
        <Route path="/de/board/" element={localeBoardRedirect("de")} />
        <Route path="/de/files" element={localeFilesRedirect("de")} />
        <Route path="/de/files/" element={localeFilesRedirect("de")} />
        <Route path="/fr/" element={<LandingRoute locale="fr" />} />
        <Route path="/fr" element={<Navigate to="/fr/" replace />} />
        <Route path="/fr/board" element={localeBoardRedirect("fr")} />
        <Route path="/fr/board/" element={localeBoardRedirect("fr")} />
        <Route path="/fr/files" element={localeFilesRedirect("fr")} />
        <Route path="/fr/files/" element={localeFilesRedirect("fr")} />
        <Route path="/tr/" element={<LandingRoute locale="tr" />} />
        <Route path="/tr" element={<Navigate to="/tr/" replace />} />
        <Route path="/tr/board" element={localeBoardRedirect("tr")} />
        <Route path="/tr/board/" element={localeBoardRedirect("tr")} />
        <Route path="/tr/files" element={localeFilesRedirect("tr")} />
        <Route path="/tr/files/" element={localeFilesRedirect("tr")} />
        <Route path="/it/" element={<LandingRoute locale="it" />} />
        <Route path="/it" element={<Navigate to="/it/" replace />} />
        <Route path="/it/board" element={localeBoardRedirect("it")} />
        <Route path="/it/board/" element={localeBoardRedirect("it")} />
        <Route path="/it/files" element={localeFilesRedirect("it")} />
        <Route path="/it/files/" element={localeFilesRedirect("it")} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppErrorBoundary>
  );
}
