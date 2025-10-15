import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App.jsx"; // <--- Правильный путь
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);