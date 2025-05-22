import { BasicConfig, Settings, DesignSettings } from "@react-awesome-query-builder/ui";
import { ConfigProviderProps } from "antd";
import { generateCssVars } from "../utils/theming";

type Locale = ConfigProviderProps["locale"];
type ThemeConfig = ConfigProviderProps["theme"];
type SettingsTheme = NonNullable<Settings["theme"]>;
type GenerateCssVars = NonNullable<NonNullable<DesignSettings>["generateCssVars"]>;
interface SettingsThemeExt extends SettingsTheme {
  antd?: ThemeConfig;
}
interface GenerateCssVarsExt extends GenerateCssVars {
  antd?: typeof generateCssVars;
}
interface DesignSettingsExt extends DesignSettings {
  generateCssVars?: GenerateCssVarsExt;
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
  designSettings?: DesignSettingsExt;
}
export interface AntdConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const AntdConfig: AntdConfig;
export default AntdConfig;
