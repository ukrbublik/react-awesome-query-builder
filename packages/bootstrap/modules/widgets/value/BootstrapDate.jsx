import React from "react";
import { Input } from "reactstrap";

export default (props) => {
  const {value, setValue, config, valueFormat, readonly} = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    setValue(value);
  };
  
  return (
    <Input type="date" bsSize={"sm"} value={value || ""} disabled={readonly} onChange={onChange} />
  );
};
