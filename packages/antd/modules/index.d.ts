import {BasicConfig} from "@react-awesome-query-builder/ui";
export {default as AntdWidgets} from "./widgets";
export { buildPalette, generateCssVars } from "./utils/theming";

import type { AntdConfig as AntdConfigType} from "./config";
export declare const AntdConfig: AntdConfigType;
export type AntdConfig = AntdConfigType;

// re-export
export * from "@react-awesome-query-builder/ui";
