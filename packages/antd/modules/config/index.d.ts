import { BasicConfig, Settings } from "@react-awesome-query-builder/ui";
import { ConfigProviderProps } from "antd";

type Locale = ConfigProviderProps["locale"];
type ThemeConfig = ConfigProviderProps["theme"];

type BasicTheme = Settings["theme"];
type BasicAntdTheme = NonNullable<NonNullable<BasicTheme>["antd"]>;
interface AntdTheme extends BasicAntdTheme {
  antd: ThemeConfig;
}
interface AntdSettings extends Settings {
  theme: AntdTheme;
}
export interface AntdConfig extends BasicConfig {
  settings: AntdSettings;
}

declare const AntdConfig: AntdConfig;
export default AntdConfig;
