import React from "react";
import { TimePicker } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { dayjs } = Utils;

export default (props) => {
  const {
    value,
    setValue,
    config,
    valueFormat,
    use12Hours,
    readonly,
    customProps,
  } = props;

  const dayjsValue = value ? dayjs(value, valueFormat) : undefined;
  const timeValue = dayjsValue ? dayjsValue.toDate() : undefined;

  const onChange = (_e, date) => {
    // clear if invalid date
    if (date == "" || date instanceof Date && isNaN(date))
      date = undefined;
    const newValue = date ? dayjs(date).format(valueFormat) : undefined;
    setValue(newValue);
  };

  const hasSeconds = valueFormat.indexOf(":ss") != -1;

  const stylesOptionsContainer = {
    optionsContainerWrapper: {
      height: "500px",
    }
  };
  
  return (
    <TimePicker
      styles={stylesOptionsContainer}
      useHour12={use12Hours}
      onChange={onChange}
      disabled={readonly}
      allowFreeform={true}
      showSeconds={hasSeconds}
      value={timeValue}
      useComboBoxAsMenuWidth
      {...customProps}
    />
  );
};
