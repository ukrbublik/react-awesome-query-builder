import { BasicConfig, Settings } from "@react-awesome-query-builder/ui";
import { Theme, ThemeOptions } from "@mui/material/styles";

type SettingsTheme = NonNullable<Settings["theme"]>;
interface SettingsThemeExt extends SettingsTheme {
  mui?: ThemeOptions; // Theme | ThemeOptions
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
}
export interface MuiConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const MuiConfig: MuiConfig;
export default MuiConfig;
