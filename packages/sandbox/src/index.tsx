import React from "react";
import { createRoot } from "react-dom/client";
import Demo from "./demo/demo";

console.log("React version:", React.version);

interface AppState {
  skin: string;
}

const App: React.FC = () => {
  const [state, setState] = React.useState<AppState>({
    skin: "mui",
  });

  const changeSkin = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skin = e.target.value;
    setState(state => ({ ...state, skin }));
  };

  return (
    <div className="App">
      <select value={state.skin} onChange={changeSkin}>
        <option value={"mui"}>mui</option>
        <option value={"antd"}>antd</option>
      </select>
      <Demo skin={state.skin} />
    </div>
  );
};

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(<App />);
