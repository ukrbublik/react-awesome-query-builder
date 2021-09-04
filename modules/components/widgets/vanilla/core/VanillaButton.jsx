import React from "react";

export default ({type, label, onClick, config}) => {
  const typeToLabel = {
    "addRuleGroup": "+",
    "addRuleGroupExt": "+",
    "delGroup": "x",
    "delRuleGroup": "x",
    "delRule": "x",
  };
  const btnLabel = label || typeToLabel[type];
  return <button onClick={onClick} type="button" className="btn btn-sm btn-outline-primary mr-2">{btnLabel}</button>;
};
