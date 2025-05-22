import { BasicConfig, Settings } from "@react-awesome-query-builder/ui";
import { Theme, ThemeOptions } from "@material-ui/core/styles";

type SettingsTheme = NonNullable<Settings["theme"]>;
interface SettingsThemeExt extends SettingsTheme {
  material?: ThemeOptions; // Theme | ThemeOptions
}
interface SettingsExt extends Settings {
  theme?: SettingsThemeExt;
}
export interface MaterialConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const MaterialConfig: MaterialConfig;
export default MaterialConfig;
