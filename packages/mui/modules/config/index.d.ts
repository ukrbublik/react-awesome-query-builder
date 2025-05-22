import { BasicConfig, Settings, DesignSettings } from "@react-awesome-query-builder/ui";
import { Theme, ThemeOptions } from "@mui/material/styles";
import { generateCssVars } from "../utils/theming";

type BasicTheme = Settings["theme"];
type BasicGenerateCssVars = NonNullable<NonNullable<DesignSettings>["generateCssVars"]>;
type BasicMuiTheme = NonNullable<NonNullable<BasicTheme>["mui"]>;
interface MuiTheme extends BasicMuiTheme {
  mui?: ThemeOptions; // Theme | ThemeOptions
}
interface MuiGenerateCssVars extends BasicGenerateCssVars {
  mui?: typeof generateCssVars;
}
interface MuiDesignSettings extends DesignSettings {
  generateCssVars?: MuiGenerateCssVars;
}
interface MuiSettings extends Settings {
  theme?: MuiTheme;
  designSettings?: MuiDesignSettings;
}
export interface MuiConfig extends BasicConfig {
  settings: MuiSettings;
}

declare const MuiConfig: MuiConfig;
export default MuiConfig;
