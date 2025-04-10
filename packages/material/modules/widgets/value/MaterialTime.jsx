import React from "react";
import { TimePicker, KeyboardTimePicker } from "@material-ui/pickers";
import dayjs from "dayjs";
import FormControl from "@material-ui/core/FormControl";

export default (props) => {
  const {value, setValue, use12Hours, readonly, placeholder, timeFormat, valueFormat, customProps} = props;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
    setValue(formatSingleValue(value));
  };

  const useKeyboard = window?.matchMedia
    ? window.matchMedia?.("(pointer:fine), (pointer:none)").matches
    : props.useKeyboard;
  const Picker = useKeyboard ? KeyboardTimePicker : TimePicker;
  const hasSeconds = timeFormat.indexOf(":ss") != -1;
  const timeValue = value ? dayjs(value, timeFormat) : null;

  return (
    <FormControl>
      <Picker
        readOnly={readonly}
        disabled={readonly}
        ampm={!!use12Hours}
        placeholder={!readonly ? placeholder : ""}
        format={timeFormat}
        value={timeValue || null}
        onChange={handleChange}
        views={hasSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
        {...customProps}
      />
    </FormControl>
  );
};
