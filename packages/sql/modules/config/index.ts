import {
  Utils, Config, JsonTree, ImmutableTree, JsonGroup, JsonAnyRule, ConfigMixinExt,
  ImmutableList,
} from "@react-awesome-query-builder/core";


export const mixinConfigForSql = (config: Config) => {
  const $v = Symbol.for("_v");
  const $type = Symbol.for("_type");
  const $canCreate = Symbol.for("_canCreate");
  const $canChangeType = Symbol.for("_canChangeType");

  const mixin: ConfigMixinExt = {
    conjunctions: {
      AND: {
        [$canCreate]: false,
        sqlConj: "AND",
        sqlFormatConj: function (children, conj, not) {
          let ret = (children.size > 1 ? children.join(" " + "AND" + " ") : children.first()) as string;
          if (children.size > 1 || not) {
            ret = this.utils.wrapWithBrackets(ret);
          }
          if (not) {
            ret = "NOT " + ret;
          }
          return ret;
        },
      },
      OR: {
        [$canCreate]: false,
        sqlConj: "OR",
        sqlFormatConj: function (children, conj, not) {
          let ret = (children.size > 1 ? children.join(" " + "OR" + " ") : children.first()) as string;
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
      less: {
        [$canCreate]: false,
        sqlOp: "<",
      },
      less_or_equal: {
        [$canCreate]: false,
        sqlOp: "<=",
      },
      greater: {
        [$canCreate]: false,
        sqlOp: ">",
      },
      greater_or_equal: {
        [$canCreate]: false,
        sqlOp: ">=",
      },
      like: {
        [$canCreate]: false,
        sqlOp: "LIKE",
      },
      not_like: {
        [$canCreate]: false,
        sqlOp: "NOT LIKE",
      },
      starts_with: {
        [$canCreate]: false,
        sqlOp: "LIKE",
      },
      ends_with: {
        [$canCreate]: false,
        sqlOp: "LIKE",
      },
      between: {
        [$canCreate]: false,
        sqlOp: "BETWEEN",
      },
      not_between: {
        [$canCreate]: false,
        sqlOp: "NOT BETWEEN",
      },
      is_empty: {
        [$canCreate]: false,
        sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
          const empty = this.utils.sqlEmptyValue(fieldDef);
          return `COALESCE(${field}, ${empty}) = ${empty}`;
        },
      },
      is_not_empty: {
        [$canCreate]: false,
        sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
          const empty = this.utils.sqlEmptyValue(fieldDef);
          return `COALESCE(${field}, ${empty}) <> ${empty}`;
        },
      },
      is_null: {
        [$canCreate]: false,
        sqlOp: "IS NULL",
      },
      is_not_null: {
        [$canCreate]: false,
        sqlOp: "IS NOT NULL",
      },
      select_equals: {
        [$canCreate]: false,
        sqlOp: "=", // enum/set
      },
      select_not_equals: {
        [$canCreate]: false,
        sqlOp: "<>", // enum/set
        sqlOps: ["<>", "!="],
      },
      select_any_in: {
        [$canCreate]: false,
        sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
          if (valueSrc === "value") {
            const valuesList = values as ImmutableList<string>;
            return `${field} IN (${valuesList.join(", ")})`;
          } else return undefined; // not supported
        },
      },
      select_not_any_in: {
        [$canCreate]: false,
        sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
          if (valueSrc === "value") {
            const valuesList = values as ImmutableList<string>;
            return `${field} NOT IN (${valuesList.join(", ")})`;
          } else return undefined; // not supported
        },
      },
      multiselect_contains: {
        [$canCreate]: false,
        // not supported
      },
      multiselect_not_contains: {
        [$canCreate]: false,
        // not supported
      },
      multiselect_equals: {
        [$canCreate]: false,
        sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
          if (valueSrc == "value") {
            // set
            const valuesList = values as string[];
            return `${field} = '${valuesList.map(v => this.utils.SqlString.trim(v)).join(",")}'`;
          } else
            return undefined; //not supported
        },
      },
      multiselect_not_equals: {
        [$canCreate]: false,
        sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
          if (valueSrc == "value") {
            // set
            const valuesList = values as string[];
            return `${field} != '${valuesList.map(v => this.utils.SqlString.trim(v)).join(",")}'`;
          } else
            return undefined; //not supported
        },
      },
      proximity: {
        [$canCreate]: false,
        sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
          // https://learn.microsoft.com/en-us/sql/relational-databases/search/search-for-words-close-to-another-word-with-near?view=sql-server-ver16#example-1
          const valuesList = values as ImmutableList<string>;
          const val1 = valuesList.first();
          const val2 = valuesList.get(1);
          const aVal1 = this.utils.SqlString.trim(val1);
          const aVal2 = this.utils.SqlString.trim(val2);
          const prox = operatorOptions?.get("proximity") as number;
          return `CONTAINS(${field}, 'NEAR((${aVal1}, ${aVal2}), ${prox})')`;
        },
      },
    },
    widgets: {
      text: {
        [$canCreate]: false,
        sqlFormatValue: function (val: string, fieldDef, wgtDef, op, opDef) {
          if (opDef.sqlOp == "LIKE" || opDef.sqlOp == "NOT LIKE") {
            return this.utils.SqlString.escapeLike(val, op != "starts_with", op != "ends_with");
          } else {
            return this.utils.SqlString.escape(val);
          }
        },
      },
      textarea: {
        [$canCreate]: false,
        sqlFormatValue: function (val: string, fieldDef, wgtDef, op, opDef) {
          if (opDef.sqlOp == "LIKE" || opDef.sqlOp == "NOT LIKE") {
            return this.utils.SqlString.escapeLike(val, op != "starts_with", op != "ends_with");
          } else {
            return this.utils.SqlString.escape(val);
          }
        },
      },
      number: {
        [$canCreate]: false,
        sqlFormatValue: function (val: string, fieldDef, wgtDef, op, opDef) {
          return this.utils.SqlString.escape(val);
        },
      },
      slider: {
        [$canCreate]: false,
        sqlFormatValue: function (val: string, fieldDef, wgtDef, op, opDef) {
          return this.utils.SqlString.escape(val);
        },
      },
      select: {
        [$canCreate]: false,
        sqlFormatValue: function (val: string, fieldDef, wgtDef, op, opDef) {
          return this.utils.SqlString.escape(val);
        },
      },
      multiselect: {
        [$canCreate]: false,
        sqlFormatValue: function (vals: string[], fieldDef, wgtDef, op, opDef) {
          return vals.map(v => this.utils.SqlString.escape(v));
        },
      }
    },
  };

  
  const newConfig = Utils.OtherUtils.mergeIn(config, mixin);
  return newConfig as Config;
};
