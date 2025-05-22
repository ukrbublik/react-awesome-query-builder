import { BasicConfig, Settings, DesignSettings } from "@react-awesome-query-builder/ui";
import { Theme, ThemeOptions } from "@mui/material/styles";
import { generateCssVars } from "../utils/theming";

type SettingsTheme = NonNullable<Settings["theme"]>;
type GenerateCssVars = NonNullable<NonNullable<DesignSettings>["generateCssVars"]>;
interface SettingsThemeExt extends SettingsTheme {
  mui?: ThemeOptions; // Theme | ThemeOptions
}
interface GenerateCssVarsExt extends GenerateCssVars {
  mui?: typeof generateCssVars;
}
interface DesignSettingsExt extends DesignSettings {
  generateCssVars?: GenerateCssVarsExt;
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
  designSettings?: DesignSettingsExt;
}
export interface MuiConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const MuiConfig: MuiConfig;
export default MuiConfig;
