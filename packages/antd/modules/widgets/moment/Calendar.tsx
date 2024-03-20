import type { Moment } from "@react-awesome-query-builder/ui";
import { Calendar } from "antd";
import momentGenerateConfig from "./config";

const MomentCalendar = Calendar.generateCalendar<Moment>(momentGenerateConfig);

export default MomentCalendar;
