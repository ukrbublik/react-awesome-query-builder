import {
  Utils, Config, JsonTree, ImmutableTree, JsonGroup, JsonAnyRule,
} from "@react-awesome-query-builder/core";

export const mixinConfigForSql = (config: Config): Config => {
  let { conjunctions } = config;
  
  // todo: mergeIn
  conjunctions = Utils.OtherUtils.setIn(conjunctions, ["AND", "sqlConj"], "AND");

  return config;
};
