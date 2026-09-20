import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import "./m3e-loading-indicator.js";

const basename = undefined;
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { basename: basename, children: _jsx(App, {}) }) }));
