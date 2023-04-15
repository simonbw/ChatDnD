import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

export function renderPage(content: ReactNode) {
  const containerElement = document.getElementById("react-container");
  if (!containerElement) {
    throw new Error("Container not mounted");
  }
  const root = createRoot(containerElement);
  root.render(content);

  // Live reload (only in dev)
  if (process?.env?.NODE_ENV == "development") {
    window.addEventListener("load", () => {
      try {
        const source = new EventSource("/esbuild");
        source.addEventListener("change", () => location.reload());
        source.addEventListener("connection-error", (event) =>
          console.error("esbuild event stream error:", event.data)
        );
      } catch (error) {}
    });
  }
}
