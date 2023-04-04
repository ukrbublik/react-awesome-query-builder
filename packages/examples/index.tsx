
import React, {Component} from "react";
import ReactDOM from "react-dom";
const Demo = React.lazy(() => import("./demo"));
const DemoSwitch = React.lazy(() => import("./demo_switch"));
import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";

const rootElement = window.document.getElementById("root");

ReactDOM.render((
  <HashRouter>
    <Routes>
      <Route path="/switch" element={<React.Suspense fallback={<>...</>}><DemoSwitch /></React.Suspense>} />
      <Route path="*" element={<React.Suspense fallback={<>...</>}><Demo /></React.Suspense>} />
    </Routes>
  </HashRouter>
), rootElement);
