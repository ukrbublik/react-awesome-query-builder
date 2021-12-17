import React from "react";

export default (props) => {
  const {value, setValue, config, readonly, min, max, step, placeholder, customProps = {}, } = props;
  const customInputProps = customProps.input || {};
  const customSliderProps = customProps.slider || customProps;
  const onChange = e => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = Number(val);
    setValue(val);
  };
  const numberValue = value == undefined ? "" : value;
  return [
    <input key={"number"} type="number"  value={numberValue} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange} {...customInputProps} />
    ,
    <input key={"range"} type="range"  value={numberValue} disabled={readonly} min={min} max={max} step={step} onChange={onChange} {...customSliderProps} />
  ];
};
