import React from "react";
import { createRoot, Root } from "react-dom/client";
// https://ant.design/docs/react/v5-for-19
import "@ant-design/v5-patch-for-react-19";
import { unstableSetRender } from "antd";
import Demo from "./demo/demo";

const useUnstableSetRender = false;

console.log("React version:", React.version);

// https://ant.design/docs/react/v5-for-19
if (useUnstableSetRender) {
  console.log("Using unstableSetRender for antd + react 19, see https://ant.design/docs/react/v5-for-19");
  unstableSetRender((node, container) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (container as any)._reactRoot ||= createRoot(container);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const root = (container as any)._reactRoot as Root;
    root.render(node);
    return async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      root.unmount();
    };
  });
}

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
      {state.skin === "antd" && (
        <div>
          Warning: antd v5 is not fully compatible with React 19.
          <br />
          You can notice issues when trying to delete rule/group.
          <br />
          <a href="https://ant.design/docs/react/v5-for-19" target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      )}
      <Demo skin={state.skin} />
    </div>
  );
};

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(<App />);
