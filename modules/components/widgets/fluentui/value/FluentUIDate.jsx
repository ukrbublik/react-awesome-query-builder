import React from "react";
import {DatePicker} from '@fluentui/react'

export default (props) => {
  const {value, setValue, config, valueFormat, readonly, customProps, } = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    setValue(value);
  };
  
  return (
    <DatePicker
    onChange={onChange}
    />
  )
}; 