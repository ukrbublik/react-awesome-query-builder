import React from "react";

export default ({type, label, onClick, readonly, config}) => {
  const typeToLabel = {
    "addRuleGroup": "+",
    "addRuleGroupExt": "+",
    "delGroup": "x",
    "delRuleGroup": "x",
    "delRule": "x",
  };
  const btnLabel = label || typeToLabel[type];
  return <button onClick={onClick} type="button" disabled={readonly}>{btnLabel}</button>;
};
