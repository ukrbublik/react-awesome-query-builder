import React from "react";
import ReactDOM from "react-dom";
import Demo from "./demo/demo.js";


import 'react-awesome-query-builder/css/reset.scss';
import 'react-awesome-query-builder/css/styles.scss';
import 'react-awesome-query-builder/css/denormalize.scss';

function App() {
  return (
    <div className="App">
      <Demo />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

