import React from "react";
import ReactDOM from "react-dom";
import Demo from "./demo/demo";

import "antd/dist/antd.css";
import "@react-awesome-query-builder/ui/css/styles.scss";

function App() {
  return (
    <div className="App">
      <Demo />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

