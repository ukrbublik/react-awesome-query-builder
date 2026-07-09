import type { Moment } from "@react-awesome-query-builder/ui";
import { Calendar } from "antd";
import momentGenerateConfig from "./config";

const MomentCalendar = (() => {
  // @ts-ignore for antd v4 need to import picker from 'antd/es/calendar/generatePicker' (https://4x.ant.design/docs/react/replace-moment)
  if (typeof Calendar.generateCalendar === "function") {
    // @ts-ignore
    return Calendar.generateCalendar<Moment>(momentGenerateConfig);
  } else {
    // support ant 4.x
    return Calendar;
  }
})();

export default MomentCalendar;
