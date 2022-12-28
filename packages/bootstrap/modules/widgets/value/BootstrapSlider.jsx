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

  const stylesWrapper = {
    display: "inline-flex",
  };

  const stylesInputWrapper = {
    marginLeft: "5px",
  };

  const numberValue = value == undefined ? "" : value;
  return (<div style={stylesWrapper}>
    <Input key={"number"} bsSize={"sm"} style={stylesInputWrapper} type="number" value={numberValue} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
    <Input key={"range"} bsSize={"sm"} style={stylesInputWrapper} type="range" value={numberValue} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
  </div>);
};
