import React from "react";
import { Input } from "reactstrap";

export default (props) => {
  const {value, setValue, config, readonly, placeholder, maxLength} = props;
  const darkMode = config.settings.themeMode === "dark";
  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };
  
  const textValue = value || "";

  return (
    <Input
      type="text"
      bsSize={"sm"}
      value={textValue} 
      placeholder={placeholder} 
      disabled={readonly} 
      onChange={onChange}
      maxLength={maxLength}
      className={darkMode ? "bg-dark text-light border-dark placeholder-light" : undefined}
    />
  );
};
