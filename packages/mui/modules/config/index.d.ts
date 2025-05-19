import { BasicConfig, Settings } from "@react-awesome-query-builder/ui";
import { Theme, ThemeOptions } from "@mui/material/styles";

type BasicTheme = Settings["theme"];
type BasicMuiTheme = NonNullable<NonNullable<BasicTheme>["mui"]>;
interface MuiTheme extends BasicMuiTheme {
  mui: ThemeOptions; // Theme | ThemeOptions
}
interface MuiSettings extends Settings {
  theme: MuiTheme;
}
export interface MuiConfig extends BasicConfig {
  settings: MuiSettings;
}

declare const MuiConfig: MuiConfig;
export default MuiConfig;
