import { createContext, useContext, type ReactNode } from "react";
import { useAppState, type AppState } from "./useAppState";

const AppStateContext = createContext<AppState | null>(null);

/**
 * Owns BoardStore + File Session for `/board` and `/files` so File Session
 * survives Editor ↔ Local Files navigation.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return (
    <AppStateContext.Provider value={state}>{children}</AppStateContext.Provider>
  );
}

export function useAppStateContext(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppStateContext must be used within AppStateProvider");
  }
  return ctx;
}
