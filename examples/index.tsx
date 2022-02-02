
import React, {Component} from "react";
import ReactDOM from "react-dom";
import Demo from "./demo/demo";

import "../css/antd.less"; // or import "antd/dist/antd.css";
import "../css/styles.scss";
//import '../css/compact_styles.scss'; //optional

const rootElement = window.document.getElementById("root");

ReactDOM.render((
    <Demo />
), rootElement);
