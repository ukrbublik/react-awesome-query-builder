import React from "react";

const typeToLabel = {
  "addSubRuleSimple": "+",
  "addSubRule": "+",
  "addSubGroup": "+",
  "delGroup": "x",
  "delRuleGroup": "x",
  "delRule": "x",
};

export default ({type, label, onClick, readonly}) => {
  const btnLabel = label || typeToLabel[type];
  return <button onClick={onClick} type="button" disabled={readonly}>{btnLabel}</button>;
};
