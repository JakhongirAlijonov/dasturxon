import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n/index.js";
import "./index.css";
import App from "./App.jsx";

// defer non-critical work
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => {
    // preload Firebase auth in background
    import("firebase/auth");
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
