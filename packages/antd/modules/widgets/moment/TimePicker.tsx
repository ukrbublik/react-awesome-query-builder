import type { Moment } from "@react-awesome-query-builder/ui";
import * as React from "react";
import type { PickerTimeProps } from "antd/es/date-picker/generatePicker";
import DatePicker from "./DatePicker";

export interface TimePickerProps extends Omit<PickerTimeProps<Moment>, 'picker'> {}

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => (
  <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
));

TimePicker.displayName = 'TimePicker';

export default TimePicker;
