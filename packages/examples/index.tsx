
import React, {Component} from "react";
import ReactDOM from "react-dom";
import * as ReactDOMClient from 'react-dom/client';
const Demo = React.lazy(() => import("./demo"));
const DemoSwitch = React.lazy(() => import("./demo_switch"));
import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";

const rootElement = window.document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

root.render((
  <React.StrictMode>
  <HashRouter>
    <Routes>
      <Route path="/switch" element={<React.Suspense fallback={<>...</>}><DemoSwitch /></React.Suspense>} />
      <Route path="*" element={<React.Suspense fallback={<>...</>}><Demo /></React.Suspense>} />
    </Routes>
  </HashRouter>
  </React.StrictMode>
));
