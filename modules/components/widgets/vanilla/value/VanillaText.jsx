import React from "react";

export default (props) => {
  const {value, setValue, config, readonly, placeholder} = props;
  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };
  return (
    <input type="text"  value={value || ""} placeholder={placeholder}  disabled={readonly} onChange={onChange} />
  );
};
