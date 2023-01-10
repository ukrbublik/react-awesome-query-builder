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
    flexWrap: "wrap"
  };

  const stylesInputWrapper = {
    marginLeft: "5px",
    display: "inline-flex",
    width: "auto",
  };

  const stylesSliderWrapper = {
    marginLeft: "5px",
    display: "inline-flex",
    width: "auto",
    minWidth: "150px"
  };

  const numberValue = value == undefined ? "" : value;
  return (<div style={stylesWrapper}>
    <Input key={"number"} bsSize={"sm"} style={stylesInputWrapper} type="number" value={numberValue} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
    <Input key={"range"} bsSize={"sm"} style={stylesSliderWrapper} type="range" value={numberValue} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
  </div>);
};
