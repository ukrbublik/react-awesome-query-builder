import React from "react";
import moment from "moment";
import { FormDate } from "@shoutout-labs/shoutout-themes-enterprise";
export default (props) => {
  const { value, setValue, config, valueFormat, readonly } = props;

  const onChange = (date) => {
    if (date) {
      setValue(moment(date).format(valueFormat));
    } else {
      setValue(undefined);
    }
  };

  return (
    <FormDate
      date={value ? moment(value).toDate() : undefined}
      disabled={readonly}
      onChange={onChange}
      dateDisplayFormat={valueFormat}
      size="sm"
    />
  );
};
