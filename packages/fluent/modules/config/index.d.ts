import { BasicConfig, Settings, DesignSettings } from "@react-awesome-query-builder/ui";
import { Theme, PartialTheme } from "@fluentui/react";
import { generateCssVars } from "../utils/theming";

type SettingsTheme = NonNullable<Settings["theme"]>;
type GenerateCssVars = NonNullable<NonNullable<DesignSettings>["generateCssVars"]>;
interface SettingsThemeExt extends SettingsTheme {
  fluent?: PartialTheme; // Theme | PartialTheme
}
interface GenerateCssVarsExt extends GenerateCssVars {
  fluent?: typeof generateCssVars;
}
interface DesignSettingsExt extends DesignSettings {
  generateCssVars?: GenerateCssVarsExt;
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
  designSettings?: DesignSettingsExt;
}
export interface FluentUIConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const FluentUIConfig: FluentUIConfig;
export default FluentUIConfig;
