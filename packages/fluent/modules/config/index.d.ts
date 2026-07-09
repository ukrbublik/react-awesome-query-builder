import { BasicConfig, Settings } from "@react-awesome-query-builder/ui";
import { Theme, PartialTheme } from "@fluentui/react";

type SettingsTheme = NonNullable<Settings["theme"]>;
interface SettingsThemeExt extends SettingsTheme {
  fluent?: PartialTheme; // Theme | PartialTheme
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
}
export interface FluentUIConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const FluentUIConfig: FluentUIConfig;
export default FluentUIConfig;
