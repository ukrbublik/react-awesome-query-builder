
import React, {Component} from "react";
import ReactDOM from "react-dom";
const Demo = React.lazy(() => import("./demo"));
const DemoSwitch = React.lazy(() => import("./demo_switch"));
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import "@react-awesome-query-builder/ui/css/antd.less"; // or import "antd/dist/antd.css";
import "@react-awesome-query-builder/ui/css/styles.scss";
//import '@react-awesome-query-builder/ui/css/compact_styles.scss'; //optional

const rootElement = window.document.getElementById("root");

ReactDOM.render((
  <BrowserRouter basename={location.host == "ukrbublik.github.io" ? "/react-awesome-query-builder" : "/"}>
    <Routes>
      <Route path="/switch" element={<React.Suspense fallback={<>...</>}><DemoSwitch /></React.Suspense>} />
      <Route path="*" element={<React.Suspense fallback={<>...</>}><Demo /></React.Suspense>} />
    </Routes>
  </BrowserRouter>
), rootElement);
