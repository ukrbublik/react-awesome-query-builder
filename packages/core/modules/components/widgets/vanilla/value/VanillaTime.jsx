import React from "react";

export default (props) => {
  const {value, setValue, config, valueFormat, use12Hours, readonly, customProps } = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    setValue(value);
  };
  
  return (
    <input type="time"  value={value || ""}  disabled={readonly} onChange={onChange} {...customProps} />
  );
};
