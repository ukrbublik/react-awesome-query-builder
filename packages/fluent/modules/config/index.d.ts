import { BasicConfig, Settings } from "@react-awesome-query-builder/ui";
import { Theme, PartialTheme } from "@fluentui/react";

type BasicTheme = Settings["theme"];
type BasicFluentTheme = NonNullable<NonNullable<BasicTheme>["fluent"]>;
interface FluentTheme extends BasicFluentTheme {
  fluent?: PartialTheme; // Theme | PartialTheme
}
interface FluentSettings extends Settings {
  theme?: FluentTheme;
}
export interface FluentUIConfig extends BasicConfig {
  settings: FluentSettings;
}

declare const FluentUIConfig: FluentUIConfig;
export default FluentUIConfig;
