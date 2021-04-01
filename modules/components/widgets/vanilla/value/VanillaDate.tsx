import React from "react";
import moment from "moment";

export default (props) => {
  const {value, setValue, config, valueFormat, readonly} = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    setValue(value);
  };
  
  return (
    <input type="date"  value={value || ""}  disabled={readonly} onChange={onChange} />
  );
};
