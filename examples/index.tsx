import { hot } from "react-hot-loader/root";
import { AppContainer } from "react-hot-loader";
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

const HotDemo = hot(Demo);
const HotDemoSwitch = hot(DemoSwitch);
const rootElement = window.document.getElementById("root");

ReactDOM.render((
  <AppContainer>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HotDemo />} />
        <Route path="switch" element={<HotDemoSwitch />} />
      </Routes>
    </BrowserRouter>
  </AppContainer>
), rootElement);
