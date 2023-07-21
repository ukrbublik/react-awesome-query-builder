import React from "react";
import { TimePicker } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;

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

  const formatSingleValue = ( value) => {
    return value ? moment(value, valueFormat).format(valueFormat) : undefined;
  };

  const hasSeconds = valueFormat.indexOf(":ss") != -1;

  const onChange = (e, value) => {
    if (value == "") value = undefined;
    setValue(formatSingleValue(value));
  };

  const timeValue = value ? moment(value, valueFormat).toDate() : null;

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
