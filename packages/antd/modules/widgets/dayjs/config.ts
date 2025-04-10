import type { Dayjs } from "@react-awesome-query-builder/ui";
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";

type GenerateConfig = typeof dayjsGenerateConfig & {
  getMillisecond(date: Dayjs): number;
  setMillisecond(date: Dayjs, millisecond: number): Dayjs;
};
const generateConfig = dayjsGenerateConfig as GenerateConfig;

if (!generateConfig.getMillisecond) {
  generateConfig.getMillisecond = (date: Dayjs) => date.millisecond();
  generateConfig.setMillisecond = (date: Dayjs, millisecond: number) => {
    const clone = date.clone();
    return clone.millisecond(millisecond);
  };
}

export default generateConfig;
