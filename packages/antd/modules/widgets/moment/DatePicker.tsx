import type { Moment } from "@react-awesome-query-builder/ui";
import { DatePicker } from "antd";
import momentGenerateConfig from "./config";

const MomentDatePicker = (() => {
  // @ts-ignore for antd v4 need to import picker from 'antd/es/date-picker/generatePicker' (https://4x.ant.design/docs/react/replace-moment)
  if (typeof DatePicker.generatePicker === "function") {
    // @ts-ignore
    return DatePicker.generatePicker<Moment>(momentGenerateConfig);
  } else {
    // support ant 4.x
    return DatePicker;
  }
})() as any as typeof DatePicker;

export default MomentDatePicker;
