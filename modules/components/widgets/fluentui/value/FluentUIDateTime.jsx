import React from "react";
import moment from "moment";
import { DatePicker, TimePicker} from "@fluentui/react"

export default (props) => {
  const {value, setValue, config, valueFormat, use12Hours, readonly, customProps, } = props;

  const onDateChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    else
      value = moment(new Date(value)).format(valueFormat);
    setValue(value);
  };

  const onTimeChange = e => {

  }
  // let dtValue = value;
  // if (!value)
  //   dtValue = "";
  // else
  //   dtValue = moment(value).format("YYYY-MM-DDTHH:mm");
  
  return (
    <div>
      <DatePicker
      disabled={readonly}
      onChange={onDateChange}
       /> 
      <TimePicker 
      useHour12={use12Hours}
      showSeconds={true}
      disabled={readonly}
      onChange={onTimeChange}
      />
    </div>
   
  );
};
