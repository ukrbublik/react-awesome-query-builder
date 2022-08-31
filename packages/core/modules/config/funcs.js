import moment from "moment";

const NOW = {
  label: "Now",
  returnType: "datetime",
  jsonLogic: "now",
  //todo: document option `jsonLogicCustomOps`
  //todo: add util to return all used custom ops to be added by user with `jsonLogic.add_operation`
  jsonLogicCustomOps: {
    now: () => new Date(),
  },
  spelFunc: "new java.util.Date()",
  sqlFormatFunc: () => "NOW()",
  mongoFormatFunc: () => new Date(),
  formatFunc: () => "NOW",
};

const RELATIVE_DATETIME = {
  label: "Relative",
  returnType: "datetime",
  renderBrackets: ["", ""],
  renderSeps: ["", "", ""],
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
    date_add: (date, val, dim) => moment(date).add(val, dim).toDate()
  },
  // MySQL
  //todo: other SQL dialects?
  sqlFormatFunc: ({date, op, val, dim}) => `DATE_ADD(${date}, INTERVAL ${parseInt(val) * (op == "minus" ? -1 : +1)} ${dim.replace(/^'|'$/g, "")})`,
  mongoFormatFunc: null, //todo: support?
  //todo: spel
  formatFunc: ({date, op, val, dim}) => (!val ? date : `${date} ${op == "minus" ? "-" : "+"} ${val} ${dim}`),
  args: {
    date: {
      label: "Date",
      type: "datetime",
      defaultValue: {func: "NOW", args: []},
      valueSources: ["func", "field"],
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
      }
    },
    val: {
      label: "Value",
      type: "number",
      fieldSettings: {
        min: 0,
      },
      defaultValue: 0,
      valueSources: ["value"],
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
      }
    },
  }
};

const LOWER = {
  label: "Lowercase",
  mongoFunc: "$toLower",
  jsonLogic: "toLowerCase",
  spelFunc: ".toLowerCase",
  //jsonLogicIsMethod: true, // Removed in JsonLogic 2.x due to Prototype Pollution
  jsonLogicCustomOps: {
    toLowerCase: (str) => str.toLowerCase(),
  },
  returnType: "text",
  args: {
    str: {
      label: "String",
      type: "text",
      valueSources: ["value", "field"],
    },
  }
};

const UPPER = {
  label: "Uppercase",
  mongoFunc: "$toUpper",
  jsonLogic: "toUpperCase",
  spelFunc: ".toUpperCase",
  //jsonLogicIsMethod: true, // Removed in JsonLogic 2.x due to Prototype Pollution
  jsonLogicCustomOps: {
    toUpperCase: (str) => str.toUpperCase(),
  },
  returnType: "text",
  args: {
    str: {
      label: "String",
      type: "text",
      valueSources: ["value", "field"],
    },
  }
};

const LINEAR_REGRESSION = {
  label: "Linear regression",
  returnType: "number",
  formatFunc: ({coef, bias, val}, _) => `(${coef} * ${val} + ${bias})`,
  sqlFormatFunc: ({coef, bias, val}) => `(${coef} * ${val} + ${bias})`,
  spelFormatFunc: ({coef, bias, val}) => `(${coef} * ${val} + ${bias})`,
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
  RELATIVE_DATETIME,
  LINEAR_REGRESSION,
};
