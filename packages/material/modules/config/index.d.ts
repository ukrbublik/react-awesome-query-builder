import { BasicConfig, Settings, DesignSettings } from "@react-awesome-query-builder/ui";
import { Theme, ThemeOptions } from "@material-ui/core/styles";
import { generateCssVars } from "../utils/theming";

type SettingsTheme = NonNullable<Settings["theme"]>;
type GenerateCssVars = NonNullable<NonNullable<DesignSettings>["generateCssVars"]>;
interface SettingsThemeExt extends SettingsTheme {
  material?: ThemeOptions; // Theme | ThemeOptions
}
interface GenerateCssVarsExt extends GenerateCssVars {
  material?: typeof generateCssVars;
}
interface DesignSettingsExt extends DesignSettings {
  generateCssVars?: GenerateCssVarsExt;
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
  designSettings?: DesignSettingsExt;
}
export interface MaterialConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const MaterialConfig: MaterialConfig;
export default MaterialConfig;
