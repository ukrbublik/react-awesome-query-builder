import React from "react";
import { Form } from '@shoutout-labs/shoutout-themes-enterprise';
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
  return [
    <Form.Control size="sm" key={"number"} type="number"  value={numberValue} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange}/>
    // <input key={"number"} type="number"  value={numberValue} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
    ,
    <Form.Control size="sm" key={"range"} type="range"  value={numberValue} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
  ];
};
