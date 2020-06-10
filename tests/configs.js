import React from "react";
import AntdConfig from "react-awesome-query-builder/config/antd";
import AntdWidgets from "react-awesome-query-builder/components/widgets/antd";
const {
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
} = AntdWidgets;


export const simple_with_number = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      label: "Number",
      type: "number",
      preferWidgets: ["number"],
      fieldSettings: {
        min: -1,
        max: 5
      },
    },
  },
});

export const simple_with_2_numbers = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      label: "Number",
      type: "number",
      preferWidgets: ["number"],
    },
    num2: {
      label: "Number2",
      type: "number",
      preferWidgets: ["number"],
    },
  },
});

export const simple_with_numbers_and_str = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      label: "Number",
      type: "number",
      preferWidgets: ["number"],
      fieldSettings: {
        min: -1,
        max: 5
      },
    },
    num2: {
      label: "Number2",
      type: "number",
      preferWidgets: ["number"],
    },
    str: {
      label: "String",
      type: "text",
    },
    str2: {
      label: "String",
      type: "text",
      excludeOperators: ["equal"],
    },
  },
});
  
export const with_number_and_string = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      label: "Number",
      type: "number",
      preferWidgets: ["number"],
      fieldSettings: {
        min: -1,
        max: 5
      },
    },
    login: {
      type: "text",
      excludeOperators: ["proximity"],
      fieldSettings: {
        validateValue: (val, fieldSettings) => {
          return (val.length < 10 && (val == "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
        },
      },
      mainWidgetProps: {
        valueLabel: "Login",
        valuePlaceholder: "Enter login",
      },
    }
  },
});
  
export const with_date_and_time = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    date: {
      label: "Date",
      type: "date",
    },
    time: {
      label: "Time",
      type: "time",
    },
    datetime: {
      label: "DateTime",
      type: "datetime",
    },
  },
});
  
  
export const with_select = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    // new format of listValues
    color: {
      label: "Color",
      type: "select",
      listValues: [
        { value: "yellow", title: "Yellow" },
        { value: "green", title: "Green" },
        { value: "orange", title: "Orange" },
      ],
    },
    // old format of listValues
    color2: {
      label: "Color2",
      type: "select",
      listValues: {
        yellow: "Yellow",
        green: "Green",
        orange: "Orange",
      },
    },
    multicolor: {
      label: "Colors",
      type: "multiselect",
      listValues: {
        yellow: "Yellow",
        green: "Green",
        orange: "Orange"
      },
      allowCustomValues: false
    },
  
  },
});
  
export const with_struct_and_group = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    user: {
      label: "User",
      tooltip: "Group of fields",
      type: "!struct",
      subfields: {
        firstName: {
          label2: "Username", //only for menu's toggler
          type: "text",
          mainWidgetProps: {
            valueLabel: "Name",
            valuePlaceholder: "Enter name",
          },
        },
        login: {
          type: "text",
          mainWidgetProps: {
            valueLabel: "Login",
            valuePlaceholder: "Enter login",
          },
        },
      }
    },
    results: {
      label: "Results",
      type: "!group",
      subfields: {
        slider: {
          label: "Slider",
          type: "number",
          preferWidgets: ["slider", "rangeslider"],
          valueSources: ["value", "field"],
          fieldSettings: {
            min: 0,
            max: 100,
            step: 1,
            marks: {
              0: <strong>0%</strong>,
              100: <strong>100%</strong>
            },
          },
          //overrides
          widgets: {
            slider: {
              widgetProps: {
                valuePlaceholder: "..Slider",
              }
            }
          },
        },
        stock: {
          label: "In stock",
          type: "boolean",
          defaultValue: true,
          mainWidgetProps: {
            labelYes: "+",
            labelNo: "-"
          }
        },
      }
    },
  }
});

export const with_all_types = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      label: "Number",
      type: "number",
      preferWidgets: ["number"],
      fieldSettings: {
        min: 0,
        max: 10,
      },
    },
    str: {
      label: "String",
      type: "text",
    },
    date: {
      label: "Date",
      type: "date",
    },
    time: {
      label: "Time",
      type: "time",
    },
    datetime: {
      label: "DateTime",
      type: "datetime",
    },
    slider: {
      label: "Slider",
      type: "number",
      preferWidgets: ["slider", "rangeslider"],
      fieldSettings: {
        min: 0,
        max: 100,
        step: 1,
      },
    },
    stock: {
      label: "In stock",
      type: "boolean",
      defaultValue: true,
    },
    color: {
      label: "Color",
      type: "select",
      listValues: [
        { value: "yellow", title: "Yellow" },
        { value: "green", title: "Green" },
        { value: "orange", title: "Orange" },
      ],
    },
    multicolor: {
      label: "Colors",
      type: "multiselect",
      listValues: {
        yellow: "Yellow",
        green: "Green",
        orange: "Orange"
      },
      allowCustomValues: false
    },
    selecttree: {
      label: "Color (tree)",
      type: "treeselect",
      fieldSettings: {
        treeExpandAll: true,
        listValues: [
          { value: "1", title: "Warm colors" },
          { value: "2", title: "Red", parent: "1" },
          { value: "3", title: "Orange", parent: "1" },
          { value: "4", title: "Cool colors" },
          { value: "5", title: "Green", parent: "4" },
          { value: "6", title: "Blue", parent: "4" },
          { value: "7", title: "Sub blue", parent: "6" },
          { value: "8", title: "Sub sub blue and a long text", parent: "7" },
        ],
      }
    },
    multiselecttree: {
      label: "Colors (tree)",
      type: "treemultiselect",
      fieldSettings: {
        treeExpandAll: true,
        listValues: [
          { value: "1", title: "Warm colors", children: [
            { value: "2", title: "Red" },
            { value: "3", title: "Orange" }
          ] },
          { value: "4", title: "Cool colors", children: [
            { value: "5", title: "Green" },
            { value: "6", title: "Blue", children: [
              { value: "7", title: "Sub blue", children: [
                { value: "8", title: "Sub sub blue and a long text" }
              ] }
            ] }
          ] }
        ]
      }
    },
  },
});

export const simple_with_number_without_regroup = (BasicConfig) => ({
  ...simple_with_number(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    canRegroup: false,
  }
});

export const with_all_types__show_error = (BasicConfig) => ({
  ...with_all_types(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    showErrorMessage: true,
  }
});

export const with_funcs = (BasicConfig) => ({
  ...BasicConfig,
  funcs: {
    LOWER: {
      label: "Lowercase",
      mongoFunc: "$toLower",
      jsonLogic: "toLowerCase",
      jsonLogicIsMethod: true,
      returnType: "text",
      args: {
        str: {
          label: "String",
          type: "text",
          valueSources: ["value", "field"],
        },
      }
    },
    LINEAR_REGRESSION: {
      label: "Linear regression",
      returnType: "number",
      formatFunc: ({coef, bias, val}, _) => `(${coef} * ${val} + ${bias})`,
      sqlFormatFunc: ({coef, bias, val}) => `(${coef} * ${val} + ${bias})`,
      mongoFormatFunc: ({coef, bias, val}) => ({"$sum": [{"$multiply": [coef, val]}, bias]}),
      jsonLogic: ({coef, bias, val}) => ({ "+": [ {"*": [coef, val]}, bias ] }),
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
    },
  },
  fields: {
    num: {
      label: "Number",
      type: "number",
    },
    str: {
      label: "String",
      type: "text",
    },
    str2: {
      label: "String2",
      type: "text",
    },
  }
});

export const with_struct = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    user: {
      label: "User",
      tooltip: "Group of fields",
      type: "!struct",
      subfields: {
        login: {
          type: "text",
        },
        info: {
          type: "!struct",
          subfields: {
            firstName: {
              type: "text",
            },
          }
        }
      }
    },
  },
});

export  const with_cascader = (AntdConfig) => {
  const config = with_struct(AntdConfig);
  return {
    ...config,
    settings: {
      ...config.settings,
      renderField: (props) => <FieldCascader {...props} />,
    },
  };
};

export  const with_tree_select = (AntdConfig) => {
  const config = with_struct(AntdConfig);
  return {
    ...config,
    settings: {
      ...config.settings,
      renderField: (props) => <FieldTreeSelect {...props} />,
    },
  };
};

export  const with_dropdown = (AntdConfig) => {
  const config = with_struct(AntdConfig);
  return {
    ...config,
    settings: {
      ...config.settings,
      renderField: (props) => <FieldDropdown {...props} />,
    },
  };
};

export const with_prox = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    str: {
      label: "String",
      type: "text",
    },
  },
});
  