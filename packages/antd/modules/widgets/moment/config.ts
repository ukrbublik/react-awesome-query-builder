import type { Moment } from "@react-awesome-query-builder/ui";
import momentGenerateConfig from "rc-picker/lib/generate/moment";

type GenerateConfig = typeof momentGenerateConfig & {
  getMillisecond(date: Moment): number;
  setMillisecond(date: Moment, millisecond: number): Moment;
};
const generateConfig = momentGenerateConfig as GenerateConfig;

if (!generateConfig.getMillisecond) {
  generateConfig.getMillisecond = (date: Moment) => date.millisecond();
  generateConfig.setMillisecond = (date: Moment, millisecond: number) => {
    const clone = date.clone();
    return clone.millisecond(millisecond);
  };
}

export default generateConfig;
