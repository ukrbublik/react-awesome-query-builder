import React from "react";
import { Stack, IStackTokens } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';

export default ({type, label, onClick, readonly, config}) => {
  const typeToLabel = {
    "addRuleGroup": "+",
    "addRuleGroupExt": "+",
    "delGroup": "x",
    "delRuleGroup": "x",
    "delRule": "x",
  };
  const btnLabel = label || typeToLabel[type];
  return (
    <DefaultButton
      onClick={onClick} 
      disabled={readonly}
    >
      {btnLabel}
    </DefaultButton>
  );
};
