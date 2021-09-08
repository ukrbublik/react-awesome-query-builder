import React from "react";
import { Button } from "@shoutout-labs/shoutout-themes-enterprise";
export default ({ type, label, onClick, config }) => {
  const typeToLabel = {
    "addRuleGroup": "+",
    "addRuleGroupExt": "+",
    "delGroup": "x",
    "delRuleGroup": "x",
    "delRule": "x",
  };
  const btnLabel = label || typeToLabel[type];


  if (type === "delRule"||type==="delGroup") {
    return <Button onClick={onClick} type="button" variant="outline-danger" size="sm">{btnLabel}</Button>;
  }
  return <Button onClick={onClick} type="button" variant="outline-primary" size="sm" className="ml-2">{btnLabel}</Button>;
};
