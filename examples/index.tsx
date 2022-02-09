
import React, {Component} from "react";
import ReactDOM from "react-dom";
import Demo from "./demo";
import DemoSwitch from "./demo_switch";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import "../css/antd.less"; // or import "antd/dist/antd.css";
import "../css/styles.scss";
//import '../css/compact_styles.scss'; //optional

const rootElement = window.document.getElementById("root");

ReactDOM.render((
  <BrowserRouter basename={location.host == "ukrbublik.github.io" ? "/react-awesome-query-builder" : "/"}>
    <Routes>
      <Route path="/switch" element={<DemoSwitch />} />
      <Route path="*" element={<Demo />} />
    </Routes>
  </BrowserRouter>
), rootElement);
