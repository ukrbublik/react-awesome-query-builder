//import { customJsonLogicOperations } from "../utils/jsonLogic";

// Tip: search for `customJsonLogicOperations` in codebase to see custom JL funcs we use in `jsonLogicCustomOps`

const NOW = {
  label: "Now",
  returnType: "datetime",
  jsonLogic: "now",
  jsonLogicCustomOps: {
    now: {},
  },
  //spelFunc: "new java.util.Date()",
  spelFunc: "T(java.time.LocalDateTime).now()",
  sqlFormatFunc: () => "NOW()",
  sqlFunc: "NOW",
  mongoFormatFunc: function () {
    return {
      "$toDate": "$$NOW"
    };
    // return {
    //   "$dateFromString": {
    //     "dateString": this.utils.moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    //     "format": "%Y-%m-%d %H:%M:%S"
    //   }
    // };
  },
  formatFunc: () => "NOW",
};

const TODAY = {
  label: "Today",
  returnType: "date",
  jsonLogic: "today",
  jsonLogicCustomOps: {
    today: {},
  },
  spelFunc: "T(java.time.LocalDate).now()",
  sqlFormatFunc: () => "CURDATE()",
  sqlFunc: "CURDATE",
  mongoFormatFunc: function () {
    return {
      "$dateTrunc": {
        // or "date": "$$NOW",
        "date": { "$toDate": "$$NOW" },
        "unit": "day"
      }
    };
    // return {
    //   "$dateFromString": {
    //     "dateString": this.utils.moment(new Date()).format("YYYY-MM-DD"),
    //     "format": "%Y-%m-%d"
    //   }
    // };
  },
  formatFunc: () => "TODAY",
};

const START_OF_DAY = {
  label: "Start of day",
  returnType: "datetime",
  jsonLogic: "start_of_date",
  jsonLogicCustomOps: {
    start_of_date: {},
  },
  spelFunc: "T(java.time.LocalDateTime).now().truncatedTo(T(java.time.temporal.ChronoUnit).DAYS)",
  spelImport: (spel) => {
    // spel = {
    //   "type": "!func",
    //   "methodName": "truncatedTo",
    //   "args": [
    //     {
    //       "type": "compound",
    //       "children": [
    //         { "type": "!type", "cls": [ "java", "time", "temporal", "ChronoUnit" ] },
    //         { "type": "property", "val": "DAYS" }
    //       ]
    //     }
    //   ],
    //   "obj": {
    //     "type": "!func",
    //     "methodName": "now",
    //     "obj": {
    //       "type": "!type",
    //       "cls": [ "java", "time", "LocalDateTime" ]
    //     }
    //   }
    // }
    const { obj, args } = spel;
    const isTruncate = spel?.type === "!func" && spel?.methodName === "truncatedTo";
    const isObjNow = obj?.methodName === "now" && obj?.obj?.cls?.join(".") === "java.time.LocalDateTime";
    const argsLength = args?.length || 0;
    const oneArg = args?.[0];
    const oneArgType = oneArg?.children?.[0];
    const oneArgProperty = oneArg?.children?.[1];
    const oneArgCls = oneArgType?.type === "!type" && oneArgType?.cls?.join(".");
    const oneArgConst = oneArgProperty?.type === "property" && oneArgProperty?.val;
    const isArgDays = argsLength === 1 && oneArg.type === "compound" && oneArgCls === "java.time.temporal.ChronoUnit" && oneArgConst === "DAYS";
    if (isObjNow && isTruncate && isArgDays) {
      return {};
    }
  },
  sqlFormatFunc: () => "DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00')",
  sqlImport: function (sqlObj, _, sqlDialect) {
    if (sqlObj?.func === "DATE_FORMAT" && sqlObj.children?.length === 2) {
      const [date, format] = sqlObj.children;
      if (format?.value == "%Y-%m-%d 00:00:00" && date?.func == "NOW") {
        return {
          args: {}
        };
      }
    }
  },
  mongoFormatFunc: function () {
    return {
      "$dateTrunc": {
        "date": { "$toDate": "$$NOW" },
        "unit": "day"
      }
    };
    // return {
    //   "$dateFromString": {
    //     "dateString": this.utils.moment(new Date()).format("YYYY-MM-DD"),
    //     "format": "%Y-%m-%d"
    //   }
    // };
  },
  formatFunc: () => "TODAY",
};

const RELATIVE_DATETIME = {
  label: "Relative",
  returnType: "datetime",
  renderBrackets: ["", ""],
  renderSeps: ["", "", ""],
  spelFormatFunc: ({date, op, val, dim}) => {
    const dimPlural = dim.charAt(0).toUpperCase() + dim.slice(1) + "s";
    const method = op + dimPlural;
    return `${date}.${method}(${val})`;
  },
  spelImport: (spel) => {
    let date, op, val, dim;
    const matchRes = spel.methodName?.match(/^(minus|plus)(\w+)s$/);
    if (matchRes) {
      dim = matchRes[2].toLowerCase();
      op = matchRes[1];
      if (["minus", "plus"].includes(op)) {
        if (["day", "week", "month", "year"].includes(dim)) {
          op = {type: "string", val: op};
          dim = {type: "string", val: dim};
          val = spel.args[0];
          date = spel.obj;
          return {date, op, val, dim};
        }
      }
    }
  },
  jsonLogic: ({date, op, val, dim}) => ({
    "datetime_add": [
      date,
      val * (op == "minus" ? -1 : +1),
      dim
    ]
  }),
  jsonLogicImport: (v) => {
    const date = v["datetime_add"][0];
    const val = Math.abs(v["datetime_add"][1]);
    const op = v["datetime_add"][1] >= 0 ? "plus" : "minus";
    const dim = v["datetime_add"][2];
    return [date, op, val, dim];
  },
  jsonLogicCustomOps: {
    datetime_add: {},
  },
  // MySQL
  //todo: other SQL dialects?
  sqlFormatFunc: ({date, op, val, dim}) => `DATE_ADD(${date}, INTERVAL ${parseInt(val) * (op == "minus" ? -1 : +1)} ${dim.replace(/^'|'$/g, "")})`,
  sqlImport: function (sqlObj, _, sqlDialect) {
    if (["DATE_ADD", "DATE_SUB"].includes(sqlObj?.func) && sqlObj.children?.length === 2) {
      const [date, interval] = sqlObj.children;
      if (interval._type == "interval") {
        return {
          args: {
            date,
            op: sqlObj?.func === "DATE_ADD" ? "plus" : "minus",
            val: interval.value,
            dim: interval.unit,
          }
        };
      }
    }
  },
  mongoFormatFunc: function ({date, op, val, dim}) {
    return {
      "$dateAdd": {
        "startDate": date,
        "unit": dim,
        "amount": val * (op == "minus" ? -1 : +1),
      }
    };
  },
  formatFunc: ({date, op, val, dim}) => (!val ? date : `${date} ${op == "minus" ? "-" : "+"} ${val} ${dim}`),
  args: {
    date: {
      label: "Datetime",
      type: "datetime",
      defaultValue: {func: "NOW", args: []},
      valueSources: ["func", "field", "value"],
      escapeForFormat: true,
    },
    op: {
      label: "Op",
      type: "select",
      defaultValue: "plus",
      valueSources: ["value"],
      mainWidgetProps: {
        customProps: {
          showSearch: false
        }
      },
      fieldSettings: {
        listValues: {
          plus: "+",
          minus: "-",
        },
      },
      escapeForFormat: false,
    },
    val: {
      label: "Value",
      type: "number",
      fieldSettings: {
        min: 0,
      },
      defaultValue: 0,
      valueSources: ["value"],
      escapeForFormat: false,
    },
    dim: {
      label: "Dimension",
      type: "select",
      defaultValue: "day",
      valueSources: ["value"],
      mainWidgetProps: {
        customProps: {
          showSearch: false
        }
      },
      fieldSettings: {
        listValues: {
          day: "day",
          week: "week",
          month: "month",
          year: "year",
        },
      },
      escapeForFormat: false,
    },
  }
};


const RELATIVE_DATE = {
  ...RELATIVE_DATETIME,
  label: "Relative",
  returnType: "date",
  jsonLogic: ({date, op, val, dim}) => ({
    "date_add": [
      date,
      val * (op == "minus" ? -1 : +1),
      dim
    ]
  }),
  jsonLogicImport: (v) => {
    const date = v["date_add"][0];
    const val = Math.abs(v["date_add"][1]);
    const op = v["date_add"][1] >= 0 ? "plus" : "minus";
    const dim = v["date_add"][2];
    return [date, op, val, dim];
  },
  jsonLogicCustomOps: {
    date_add: {},
  },
  args: {
    date: {
      ...RELATIVE_DATETIME.args.date,
      label: "Date",
      type: "date",
      defaultValue: {func: "TODAY", args: []},
    },
    op: {...RELATIVE_DATETIME.args.op},
    val: {...RELATIVE_DATETIME.args.val},
    dim: {...RELATIVE_DATETIME.args.dim},
  },
};

const LOWER = {
  label: "Lowercase",
  mongoFunc: "$toLower",
  jsonLogic: "toLowerCase",
  sqlFunc: "LOWER",
  spelFunc: "${str}.toLowerCase()",
  //jsonLogicIsMethod: true, // Removed in JsonLogic 2.x due to Prototype Pollution
  jsonLogicCustomOps: {
    toLowerCase: {}
  },
  returnType: "text",
  args: {
    str: {
      label: "String",
      type: "text",
      valueSources: ["value", "field", "func"],
    },
  }
};

const UPPER = {
  label: "Uppercase",
  mongoFunc: "$toUpper",
  jsonLogic: "toUpperCase",
  sqlFunc: "UPPER",
  spelFunc: "${str}.toUpperCase()",
  //jsonLogicIsMethod: true, // Removed in JsonLogic 2.x due to Prototype Pollution
  jsonLogicCustomOps: {
    toUpperCase: {},
  },
  returnType: "text",
  args: {
    str: {
      label: "String",
      type: "text",
      valueSources: ["value", "field", "func"],
    },
  }
};

const LINEAR_REGRESSION = {
  label: "Linear regression",
  returnType: "number",
  formatFunc: ({coef, bias, val}, _) => `(${coef} * ${val} + ${bias})`,
  sqlFormatFunc: ({coef, bias, val}) => `(${coef} * ${val} + ${bias})`,
  spelFormatFunc: ({coef, bias, val}) => `(${coef} * ${val} + ${bias})`,
  spelImport: (spel) => {
    let coef, val, bias, a;
    if (spel.type === "op-plus") {
      [a, bias] = spel.children;
      if (a.type === "op-multiply") {
        [coef, val] = a.children;
        return {coef, val, bias};
      }
    }
  },
  sqlImport: function (sqlObj, _, sqlDialect) {
    if (["+"].includes(sqlObj?.operator) && sqlObj.children?.length === 2) {
      const [left, bias] = sqlObj.children;
      if (["*"].includes(left?.operator) && left.children?.length === 2) {
        const [coef, val] = left.children;
        return {
          args: {
            coef,
            val,
            bias,
          }
        };
      }
    }
  },
  mongoFormatFunc: ({coef, bias, val}) => ({"$sum": [{"$multiply": [coef, val]}, bias]}),
  jsonLogic: ({coef, bias, val}) => ({ "+": [ {"*": [coef, val]}, bias ] }),
  jsonLogicImport: (v) => {
    const coef = v["+"][0]["*"][0];
    const val = v["+"][0]["*"][1];
    const bias = v["+"][1];
    return [coef, val, bias];
  },
  renderBrackets: ["", ""],
  renderSeps: [" * ", " + "],
  args: {
    coef: {
      label: "Coef",
      type: "number",
      defaultValue: 1,
      valueSources: ["value"],
    },
    val: {
      label: "Value",
      type: "number",
      valueSources: ["value", "field"],
    },
    bias: {
      label: "Bias",
      type: "number",
      defaultValue: 0,
      valueSources: ["value"],
    }
  }
};

export {
  LOWER,
  UPPER,
  NOW,
  TODAY,
  START_OF_DAY,
  RELATIVE_DATETIME,
  RELATIVE_DATE,
  LINEAR_REGRESSION,
};
