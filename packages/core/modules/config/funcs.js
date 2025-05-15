//import { customJsonLogicOperations } from "../utils/jsonLogic";

// Tip: search for `customJsonLogicOperations` in codebase to see custom JL funcs we use in `jsonLogicCustomOps`

const NOW = {
  label: "Now",
  returnType: "datetime",
  jsonLogicCustomOps: {
    now: {},
  },
  // jsonLogic: "now",
  jsonLogic: () => {
    return {now: []};
  },
  jsonLogicImport: (v) => {
    if (v["now"]) {
      return [];
    }
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

// todo: add option like `resolveWithValueOnExport: false` for NOW, TODAY, START_OF_TODAY (issue #1234) ???

const TODAY = {
  label: "Today",
  returnType: "date",
  //jsonLogic: "today",
  jsonLogicCustomOps: {
    today: {},
  },
  jsonLogic: () => {
    return {today: []};
  },
  jsonLogicImport: (v) => {
    if (v["today"]) {
      return [];
    }
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

const START_OF_TODAY = {
  label: "Start of today",
  returnType: "datetime",
  jsonLogicCustomOps: {
    start_of_today: {},
  },
  // jsonLogic: "start_of_today",
  jsonLogic: () => {
    return {start_of_today: []};
  },
  jsonLogicImport: (v) => {
    if (v["start_of_today"]) {
      return [];
    }
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
  formatFunc: () => "START_OF_TODAY",
};

const TRUNCATE_DATETIME = {
  label: "Truncate",
  returnType: "datetime",
  renderBrackets: ["", ""],
  renderSeps: ["to"],
  jsonLogicCustomOps: {
    datetime_truncate: {},
  },
  jsonLogic: ({date, dim}) => ({
    "datetime_truncate": [
      date,
      dim
    ]
  }),
  jsonLogicImport: (v) => {
    if (v["datetime_truncate"]) {
      const date = v["datetime_truncate"][0];
      const dim = v["datetime_truncate"][1];
      return [date, dim];
    }
  },
  spelFormatFunc: ({date, dim}) => {
    const dimPluralUppercase = (dim.charAt(0).toUpperCase() + dim.slice(1) + "s").toUpperCase();
    return `${date}.truncatedTo(T(java.time.temporal.ChronoUnit).${dimPluralUppercase})`;
  },
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
    // }
    const { args } = spel;
    const isTruncate = spel?.type === "!func" && spel?.methodName === "truncatedTo";
    const argsLength = args?.length || 0;
    const oneArg = args?.[0];
    const oneArgType = oneArg?.children?.[0];
    const oneArgProperty = oneArg?.children?.[1];
    const oneArgCls = oneArgType?.type === "!type" && oneArgType?.cls?.join(".");
    const oneArgConst = oneArgProperty?.type === "property" && oneArgProperty?.val;
    const isArgDays = argsLength === 1 && oneArg.type === "compound" && oneArgCls === "java.time.temporal.ChronoUnit" && oneArgConst;
    const dim = oneArgConst.toLowerCase().substring(0, oneArgConst.length - 1); 
    if (isTruncate && isArgDays) {
      return {
        date: spel.obj,
        dim: {type: "string", val: dim},
      };
    }
  },
  // MySQL
  sqlFormatFunc: ({date, dim}, sqlDialect) => {
    if (!sqlDialect || sqlDialect === "MySQL") {
      dim = dim.replace(/^'|'$/g, "");
      switch (dim) {
      case "second":
        return `DATE_FORMAT(${date}, '%Y-%m-%d %H:%i:%s')`;
      case "minute":
        return `DATE_FORMAT(${date}, '%Y-%m-%d %H:%i:00')`;
      case "hour":
        return `DATE_FORMAT(${date}, '%Y-%m-%d %H:00:00')`;
      case "day":
        return `DATE_FORMAT(${date}, '%Y-%m-%d 00:00:00')`;
      case "week":
        return `DATE_SUB(DATE_FORMAT(${date}, '%Y-%m-%d 00:00:00'), INTERVAL WEEKDAY(${date}) DAY)`;
      case "month":
        return `DATE_FORMAT(${date}, '%Y-%m-01 00:00:00')`;
      case "year":
        return `DATE_FORMAT(${date}, '%Y-01-01 00:00:00')`;
      }
    } else if (sqlDialect === "PostgreSQL") {
      return `date_trunc(${dim}, ${date})`;
    }
  },
  sqlImport: function (sqlObj, _, sqlDialect) {
    if (!sqlDialect || sqlDialect === "MySQL") {
      if (sqlObj?.func === "DATE_FORMAT" && sqlObj.children?.length === 2) {
        const [date, format] = sqlObj.children;
        let dim;
        switch (format?.value) {
        case "%Y-%m-%d %H:%i:%s":
          dim = "second";
          break;
        case "%Y-%m-%d %H:%i:00":
          dim = "minute";
          break;
        case "%Y-%m-%d %H:00:00":
          dim = "hour";
          break;
        case "%Y-%m-%d 00:00:00":
          dim = "day";
          break;
        case "%Y-%m-01 00:00:00":
          dim = "month";
          break;
        case "%Y-01-01 00:00:00":
          dim = "year";
        }
        if (dim) {
          return {
            args: {
              date,
              dim
            }
          };
        }
      } else if (sqlObj?.func === "DATE_SUB" && sqlObj.children?.length === 2) {
        const [dateFormat, interval] = sqlObj.children;
        const isFormat = dateFormat?.func === "DATE_FORMAT" && dateFormat.children?.length === 2;
        const isIntervalDay = interval._type == "interval" && interval.unit === "day";
        if (isFormat && isIntervalDay) {
          const [date, format] = dateFormat.children;
          if (format?.value === "%Y-%m-%d 00:00:00") {
            return {
              args: {
                date,
                dim: "week"
              }
            };
          }
        }
      }
      return undefined;
    } else if (sqlDialect === "PostgreSQL") {
      if (sqlObj?.func === "date_trunc" && sqlObj.children?.length === 2) {
        const [dim, date] = sqlObj.children;
        return {
          args: {
            date,
            dim: dim.value,
          }
        };
      }
    }
  },
  mongoFormatFunc: function ({date, dim}) {
    return {
      "$dateTrunc": {
        "date": date,
        "unit": dim,
      }
    };
  },
  formatFunc: ({date, dim}) => (`TRUNCATE ${date} TO ${dim}`),
  args: {
    date: {
      label: "Datetime",
      type: "datetime",
      defaultValue: {func: "NOW", args: []},
      valueSources: ["value", "field", "func"],
      escapeForFormat: true,
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
    if (v["datetime_add"]) {
      const date = v["datetime_add"][0];
      const val = Math.abs(v["datetime_add"][1]);
      const op = v["datetime_add"][1] >= 0 ? "plus" : "minus";
      const dim = v["datetime_add"][2];
      return [date, op, val, dim];
    }
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
      valueSources: ["value", "field", "func"],
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

// todo: add DATEDIFF (issue #142)

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
  START_OF_TODAY,
  RELATIVE_DATETIME,
  TRUNCATE_DATETIME,
  RELATIVE_DATE,
  LINEAR_REGRESSION,
};
