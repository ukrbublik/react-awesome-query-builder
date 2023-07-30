import React from "react";

const typeToLabel = {
  "addRuleGroup": "+",
  "addRuleGroupExt": "+",
  "delGroup": "x",
  "delRuleGroup": "x",
  "delRule": "x",
};

export default ({type, label, onClick, readonly, config}) => {
  const btnLabel = label || typeToLabel[type];
  return <button onClick={onClick} type="button" disabled={readonly}>{btnLabel}</button>;
};
