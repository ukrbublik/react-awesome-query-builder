import { hot } from "react-hot-loader/root";
import { AppContainer } from "react-hot-loader";
import React, {Component} from "react";
import ReactDOM from "react-dom";
import Demo from "./demo/demo";

import "../css/antd.less";
import "../css/styles.scss";
//import '../css/compact_styles.scss'; //optional

/*
 * OLD styles import
 * Requires `style: true` for antd in `.babelrc`
 * But breaks some global styles, so need to apply `reset.scss` and `denormalize.scss`
 * See https://github.com/ukrbublik/react-awesome-query-builder/issues/93
 * 
import '../css/reset.scss';
import '../css/styles.scss';
//import '../css/compact_styles.scss'; //optional
import '../css/denormalize.scss';
*/

const HotDemo = hot(Demo);
const rootElement = window.document.getElementById("root");

ReactDOM.render((
  <AppContainer>
    <HotDemo />
  </AppContainer>
), rootElement);
