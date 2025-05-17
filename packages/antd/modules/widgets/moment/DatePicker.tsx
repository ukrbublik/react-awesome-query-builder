import type { Moment } from "@react-awesome-query-builder/ui";
import { DatePicker } from "antd";
import momentGenerateConfig from "./config";

const MomentDatePicker = (() => {
  if (typeof DatePicker.generatePicker === "function") {
    return DatePicker.generatePicker<Moment>(momentGenerateConfig);
  } else {
    // support ant 4.x
    return DatePicker;
  }
})() as any as typeof DatePicker;

export default MomentDatePicker;
