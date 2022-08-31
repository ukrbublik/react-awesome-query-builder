import React from "react";
import ReactDOM from "react-dom";
import Demo from "./demo/demo";

// import '@react-awesome-query-builder/core/css/antd.less'; // need to enable LESS loader
import "antd/dist/antd.css";
import "@react-awesome-query-builder/core/css/styles.css";

function App() {
  return (
    <div className="App">
      <Demo />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

