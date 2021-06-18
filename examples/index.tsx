import { hot } from "react-hot-loader/root";
import { AppContainer } from "react-hot-loader";
import React, {Component} from "react";
import ReactDOM from "react-dom";
import Demo from "./demo/demo";

import "antd/dist/antd.css"; // or import "../css/antd.less";
import "../css/styles.scss";
//import '../css/compact_styles.scss'; //optional

const HotDemo = hot(Demo);
const rootElement = window.document.getElementById("root");

ReactDOM.render((
  <AppContainer>
    <HotDemo />
  </AppContainer>
), rootElement);
