import type { Moment } from "@react-awesome-query-builder/ui";
import { Calendar } from "antd";
import momentGenerateConfig from "./config";
const MomentCalendar = (() => {
  if (typeof Calendar.generateCalendar === "function") {
    return Calendar.generateCalendar<Moment>(momentGenerateConfig);
  } else {
    // support ant 4.x
    return Calendar;
  }
})();

export default MomentCalendar;
