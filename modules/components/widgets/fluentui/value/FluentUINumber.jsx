import React from "react";
import { TextField } from "@fluentui/react";

const FluentUINumber = (props) => {
  const { value, setValue, readonly, min, max, step, placeholder } = props;

  const onChange = (e, val) => {
    var newVal;
    if (val === "" || val === null || val === undefined) {
      newVal = undefined;
    } else {
      newVal = Number.isInteger(step) ? parseInt(val) : parseFloat(val);
    }
    setValue(newVal);
  };

  return (
    <TextField
      style={{ width: "auto" }}
      type="number"
      value={value}
      placeholder={placeholder}
      disabled={readonly}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
    />
  );
};

export default FluentUINumber;
