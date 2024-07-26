/* eslint-disable no-extra-semi */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

import {
  // Conjunctions, Types, Fields, Funcs, CoreConfig, RuleValue, RuleValueI, 
  // SimpleValue, OperatorOptionsI, FieldValueI, FieldSource, AsyncListValues,
  // InputAction,
  ImmutableTree,
  // Actions,
  // ActionMeta,
  // ItemType,
  // ItemProperties,
  // ValueSource,
  // TypedValueSourceMap,
  // ConfigContext, FactoryWithContext, RenderedReactElement, SerializedFunction,
  // ConjsProps,

  // ImmutableList, ImmutableMap, ImmutableOMap,
  // ImmutablePath,
  // ImmutableItemProperties,

  Config,
  // Settings as CoreSettings,
  Utils,
} from "@react-awesome-query-builder/core";


// import {BasicConfig} from "@react-awesome-query-builder/ui";
// export {MuiWidgets} from "./widgets";

// export declare const MuiConfig: BasicConfig;

// // re-export
// export * from "@react-awesome-query-builder/ui";

interface SqlUtils {
  loadFromSql(sqlStr: string, config: Config): [ImmutableTree | undefined, Array<string>];
}
