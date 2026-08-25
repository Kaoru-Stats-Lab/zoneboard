import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { APP_LOCALE } from "../i18n/locale";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { captureLandingHints, type FeedbackSource } from "../lib/feedbackClient";
import { trackEvent } from "../lib/ga";
import { FeedbackPanel } from "./FeedbackPanel";

type FeedbackContextValue = {
  openFeedback: (source: FeedbackSource) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const t = useCallback(
    (k: MessageKey) => messages[APP_LOCALE][k],
    [],
  );
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<FeedbackSource>("landing");

  useEffect(() => {
    captureLandingHints();
  }, []);

  const value = useMemo(
    () => ({
      openFeedback: (nextSource: FeedbackSource) => {
        setSource(nextSource);
        setOpen(true);
        trackEvent("feedback_open");
      },
    }),
    [],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackPanel
        open={open}
        source={source}
        locale={APP_LOCALE}
        onClose={() => setOpen(false)}
        t={t}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return ctx;
}
