import {
  Utils, Config, JsonTree, ImmutableTree, JsonGroup, JsonAnyRule, Conjunctions, Conjunction, ConfigMixin,
} from "@react-awesome-query-builder/core";

export const mixinConfigForSql = (config: Config) => {
  const $v = Symbol.for("_v");
  const $type = Symbol.for("_type");
  const $canCreate = Symbol.for("_canCreate");
  const $canChangeType = Symbol.for("_canChangeType");

  const mixin: ConfigMixin = {
    conjunctions: {
      AND: {
        [$canCreate]: false,
        sqlConj: "AND",
        sqlFormatConj: function (children, conj, not) {
          let ret = children.size > 1 ? children.join(" " + "AND" + " ") : children.first();
          if (children.size > 1 || not) {
            ret = this.utils.wrapWithBrackets(ret);
          }
          if (not) {
            ret = "NOT " + ret;
          }
          return ret;
        },
      }
    },
    operators: {
      equal: {
        [$canCreate]: false,
        sqlOp: "=",
      },
      not_equal: {
        [$canCreate]: false,
        sqlOp: "<>",
        sqlOps: ["<>", "!="],
      },
      //... todo
    },
    //... todo
  };

  const newConfig = Utils.OtherUtils.mergeIn(config, mixin) as Config;
  return newConfig;
};
