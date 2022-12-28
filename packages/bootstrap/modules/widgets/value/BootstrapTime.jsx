import React from "react";
import { Input } from "reactstrap";

export default (props) => {
  const {value, setValue, config, valueFormat, use12Hours, readonly} = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    setValue(value);
  };
  
  return (
    <Input type="time" bsSize={"sm"} value={value || ""} disabled={readonly} onChange={onChange} />
  );
};
