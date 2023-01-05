import React from "react";
import { Toggle } from "@fluentui/react";

const FluentUIBoolean = (props) => {
  var value = props.value,
    setValue = props.setValue,
    labelYes = props.labelYes,
    labelNo = props.labelNo,
    readonly = props.readonly;

  var onRadioChange = function onRadioChange() {
    return setValue(!value);
  };

  var onText = typeof labelYes === "string" ? labelYes : "Yes";
  var offText = typeof labelNo === "string" ? labelNo : "No";

  return (
    <Toggle
      disabled={readonly}
      onText={onText}
      offText={offText}
      onChange={onRadioChange}
    />
  );
};

export default FluentUIBoolean;
