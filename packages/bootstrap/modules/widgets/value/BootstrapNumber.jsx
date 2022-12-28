import React from "react";
import { Input } from "reactstrap";

export default (props) => {
  const {value, setValue, config, readonly, min, max, step, placeholder} = props;
  const onChange = e => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = Number(val);
    setValue(val);
  };
  const numberValue = value == undefined ? "" : value;
  return (
    <Input type="number" bsSize={"sm"} value={numberValue} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
  );
};
