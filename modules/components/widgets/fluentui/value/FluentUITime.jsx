import React from "react";
import {TimePicker} from '@fluentui/react';

export default (props) => {
  const {value, setValue, config, valueFormat, use12Hours, readonly, customProps } = props;

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    setValue(value);
  };
  
  return (
   <TimePicker
    styles={{
      optionsContainerWrapper: {
        height: '500px',
      },
      root: {
        width: '70%',
      },
    }}
    useHour12={use12Hours}
    onChange={onChange}
    disabled={readonly}
    allowFreeform={true}
    showSeconds={true}
   />
  );
};
