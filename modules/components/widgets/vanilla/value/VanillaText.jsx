import React from "react";
import { Form } from '@shoutout-labs/shoutout-themes-enterprise';
export default (props) => {
  const { value, setValue, config, readonly, placeholder, maxLength } = props;
  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };
  const textValue = value || "";
  return (
    <Form.Control
      size="sm"
      type="text"
      value={textValue}
      placeholder={placeholder}
      disabled={readonly}
      onChange={onChange}
      maxLength={maxLength}
    />
    // <input
    //   type="text" 
    //   value={textValue} 
    //   placeholder={placeholder} 
    //   disabled={readonly} 
    //   onChange={onChange}
    //   maxLength={maxLength}
    // />
  );
};
