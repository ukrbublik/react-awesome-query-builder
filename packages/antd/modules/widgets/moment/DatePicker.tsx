import type { Moment } from "@react-awesome-query-builder/ui";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import generatePicker from "antd/es/date-picker/generatePicker";

const DatePicker = generatePicker<Moment>(momentGenerateConfig);

export default DatePicker;
