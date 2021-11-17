import React from "react";
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack, IStackProps, IStackStyles } from '@fluentui/react/lib/Stack';

export default (props) => {
  const {value, setValue, config, readonly, placeholder, customProps, maxLength} = props;
  const {showLabels} = config.settings;

  const onChange = (e, val) => {
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };

  const textValue = value || "";

  return (
    <Stack>
    <TextField 
      value={textValue}
      label={!readonly && showLabels ? placeholder : ""}
      disabled={readonly}
      readOnly={readonly}
      onChange={onChange}
      {...customProps}
    />
    </Stack>
  );
};
