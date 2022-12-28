import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
const { moment } = Utils;

export default (props) => {
  const {value, setValue, config, valueFormat, use12Hours, readonly, customProps, } = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    else
      value = moment(new Date(value)).format(valueFormat);
    setValue(value);
  };

  let dtValue = value;
  if (!value)
    dtValue = "";
  else
    dtValue = moment(value).format("YYYY-MM-DDTHH:mm");
  
  return (
    <input type="datetime-local"  value={dtValue}  disabled={readonly} onChange={onChange} {...customProps} />
  );
};
