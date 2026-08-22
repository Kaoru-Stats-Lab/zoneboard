import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "react-router-dom";
import type { MessageKey } from "../i18n/messages";
import { messages, type Locale } from "../i18n/messages";
import { captureLandingHints, type FeedbackSource } from "../lib/feedbackClient";
import { FeedbackPanel } from "./FeedbackPanel";

type FeedbackContextValue = {
  openFeedback: (source: FeedbackSource) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { locale: localeParam } = useParams();
  const locale: Locale = localeParam === "en" ? "en" : "ja";
  const t = useCallback((k: MessageKey) => messages[locale][k], [locale]);
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
        locale={locale}
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
