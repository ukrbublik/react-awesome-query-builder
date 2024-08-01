import {
  Utils, Config, JsonTree, ImmutableTree, JsonGroup, JsonAnyRule,
} from "@react-awesome-query-builder/core";

export const mixinConfigForSql = (config: Config) => {
  return Utils.OtherUtils.mergeIn(config, {
    // todo
  }) as Config;
};
