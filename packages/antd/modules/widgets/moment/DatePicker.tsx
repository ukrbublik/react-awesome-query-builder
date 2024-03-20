import type { Moment } from "@react-awesome-query-builder/ui";
import { DatePicker } from "antd";
import momentGenerateConfig from "./config";

const MomentDatePicker = DatePicker.generatePicker<Moment>(momentGenerateConfig);

export default MomentDatePicker;
