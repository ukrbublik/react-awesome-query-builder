import Query from "./components/QueryContainer";
import Builder from "./components/Builder";

import BasicConfig from "./config";
import * as Hooks from "./hooks";
import * as VanillaWidgets from "./components/widgets/index";
import * as CustomOperators from "./components/operators";

// extend
import Utils from "./utils";

// re-export
// Ignore "Multiple exports of name 'Utils'"
// eslint-disable-next-line import/export
export * from "@react-awesome-query-builder/core";

// Ignore "Multiple exports of name 'Utils'"
// eslint-disable-next-line import/export
export {Query, Builder, BasicConfig, VanillaWidgets, CustomOperators, Hooks, Utils};

