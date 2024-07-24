
import React from "react";
//import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";

const Demo = React.lazy(() => import("./demo"));
const DemoSwitch = React.lazy(() => import("./demo_switch"));
import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";

console.log("React version:", React.version);

const rootElement = window.document.getElementById("root")!;
//const root = createRoot(rootElement);
//const render = (app: React.ReactElement) => { root.render(app); };
const render = (app: React.ReactElement) => { ReactDOM.render(app, rootElement); };

render(
  <HashRouter>
    <Routes>
      <Route path="/switch" element={<React.Suspense fallback={<>...</>}><DemoSwitch /></React.Suspense>} />
      <Route path="*" element={<React.Suspense fallback={<>...</>}><Demo /></React.Suspense>} />
    </Routes>
  </HashRouter>
);
