import { Component, type ErrorInfo, type ReactNode } from "react";
import { StudioStatus } from "./StudioStatus";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ZoneBoard render error", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <StudioStatus
        kicker="Error"
        title="The board failed to render"
        copy="Reload the page. Scenes on this device stay in the browser. We do not send a crash report unless you write to us."
        primary={{ to: "/board", label: "Open board" }}
        secondary={{ to: "/", label: "Home" }}
        onPrimary={() => {
          window.location.assign("/board");
        }}
      />
    );
  }
}
