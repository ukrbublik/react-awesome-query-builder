import {BasicConfig} from "@react-awesome-query-builder/ui";
export {default as MuiWidgets} from "./widgets";
export { generateCssVars } from "./utils/theming";

import type { MuiConfig as MuiConfigType} from "./config";
export declare const MuiConfig: MuiConfigType;
export type MuiConfig = MuiConfigType;

// re-export
export * from "@react-awesome-query-builder/ui";
