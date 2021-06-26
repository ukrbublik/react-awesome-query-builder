
  //todo: add jsonlogic extension for now, date_add, toLowerCase
  
const RELATIVE_DATE = {
  label: "Relative",
  returnType: "date",
  renderBrackets: ["", ""],
  renderSeps: ["", "", ""],
  jsonLogic: ({_now, op, val, dim}) => ({
    "date_add": [
      {"now": []},
      val * (op == "minus" ? -1 : +1),
      dim
    ]
  }),
  jsonLogicImport: (v) => {
    const now = "NOW";
    const val = Math.abs(v["date_add"][1]);
    const op = v["date_add"][1] >= 0 ? "plus" : "minus";
    const dim = v["date_add"][2];
    return [now, op, val, dim];
  },
  // MySQL
  sqlFormatFunc: ({_now, op, val, dim}) => `DATE_ADD(${"NOW()"}, INTERVAL ${parseInt(val) * (op == "minus" ? -1 : +1)} ${dim.replace(/^'|'$/g, '')})`,
  mongoFormatFunc: null, // not supported
  args: {
    now: {
      type: "date",
      defaultValue: "NOW",
      valueSources: ["const"],
    },
    op: {
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
      defaultValue: 1,
      valueSources: ["value"],
    },
    dim: {
      label: "Dimention",
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
  //jsonLogicIsMethod: true, // Removed in JsonLogic 2.x due to Prototype Pollution
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
  mongoFormatFunc: ({coef, bias, val}) => ({"$sum": [{"$multiply": [coef, val]}, bias]}),
  jsonLogic: ({coef, bias, val}) => ({ "+": [ {"*": [coef, val]}, bias ] }),
  /* eslint-disable */
  jsonLogicImport: (v) => {
    const coef = v["+"][0]["*"][0];
    const val = v["+"][0]["*"][1];
    const bias = v["+"][1];
    return [coef, val, bias];
  },
  /* eslint-enable */
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
      valueSources: ["value"],
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
  RELATIVE_DATE,
  LINEAR_REGRESSION,
  LOWER,
};
