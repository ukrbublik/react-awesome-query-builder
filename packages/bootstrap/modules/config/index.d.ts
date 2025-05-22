import { BasicConfig, Settings, DesignSettings } from "@react-awesome-query-builder/ui";
import { generateCssVars } from "../utils/theming";

type GenerateCssVars = NonNullable<NonNullable<DesignSettings>["generateCssVars"]>;
interface GenerateCssVarsExt extends GenerateCssVars {
  bootstrap?: typeof generateCssVars;
}
interface DesignSettingsExt extends DesignSettings {
  generateCssVars?: GenerateCssVarsExt;
}
interface SettingsExt extends Settings {
  designSettings?: DesignSettingsExt;
}
export interface BootstrapConfig extends BasicConfig {
  settings: SettingsExt;
}

declare const BootstrapConfig: BootstrapConfig;
export default BootstrapConfig;
