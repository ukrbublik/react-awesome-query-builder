import Query from "./components/QueryContainer";
import Builder from "./components/Builder";

import BasicConfig from "./config";
import * as Hooks from "./hooks";
import * as VanillaWidgets from "./components/widgets/index";
import * as CustomOperators from "./components/operators";

// re-export
export * from "@react-awesome-query-builder/core";

export {Query, Builder, BasicConfig, VanillaWidgets, CustomOperators, Hooks};

