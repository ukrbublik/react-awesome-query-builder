import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
const { moment } = Utils;

export default (props) => {
  const {value, setValue, config, valueFormat, readonly, customProps, } = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    setValue(value);
  };
  
  return (
    <input type="date"  value={value || ""}  disabled={readonly} onChange={onChange} {...customProps} />
  );
};
