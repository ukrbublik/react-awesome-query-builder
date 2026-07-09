import { BasicConfig, Settings, DesignSettings } from "@react-awesome-query-builder/ui";
import { ConfigProviderProps } from "antd";

type Locale = ConfigProviderProps["locale"];
type ThemeConfig = ConfigProviderProps["theme"];
type SettingsTheme = NonNullable<Settings["theme"]>;
interface SettingsThemeExt extends SettingsTheme {
  antd?: ThemeConfig;
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
}
export interface AntdConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const AntdConfig: AntdConfig;
export default AntdConfig;
