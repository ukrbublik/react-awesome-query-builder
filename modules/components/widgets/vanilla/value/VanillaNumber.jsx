import React from "react";

export default (props) => {
  const {value, setValue, config, readonly, min, max, step, placeholder} = props;
  const onChange = e => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = parseInt(val);
    setValue(val);
  };
  return (
    <input type="number"  value={value} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
  );
};
