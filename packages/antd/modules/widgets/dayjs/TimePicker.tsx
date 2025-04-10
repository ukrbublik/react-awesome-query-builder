import type { Dayjs } from "@react-awesome-query-builder/ui";
import { DatePicker } from "antd";
import type { PickerProps } from "antd/es/date-picker/generatePicker";
import * as React from "react";

export interface TimePickerProps extends Omit<PickerProps<Dayjs>, "picker"> {}

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => (
  <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
));

TimePicker.displayName = "TimePicker";

export default TimePicker;
