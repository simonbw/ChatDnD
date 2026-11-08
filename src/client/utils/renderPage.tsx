import { ConvexProvider } from "convex/react";
import React, { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { convex } from "../convex";
import "../styles/index.css";

export function renderPage(content: ReactNode) {
  const containerElement = document.getElementById("react-container");
  if (!containerElement) {
    throw new Error("Container not mounted");
  }
  const root = createRoot(containerElement);
  root.render(<ConvexProvider client={convex}>{content}</ConvexProvider>);
}
