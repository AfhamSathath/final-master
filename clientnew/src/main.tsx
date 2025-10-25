// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Chrome extension "message channel closed" warnings
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason?.message?.includes("message channel closed")) {
    console.warn("Suppressed Chrome extension message channel warning");
    event.preventDefault(); // prevent console error
  }
});

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
