import React from "react";

export default ({type, label, onClick, config}) => {
  const typeToLabel = {
    "addRuleGroup": "+",
    "delGroup": "x",
    "delRule": "x",
  };
  const btnLabel = typeToLabel[type] || label;
  return <button onClick={onClick}>{btnLabel}</button>;
};
