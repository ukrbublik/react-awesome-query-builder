import React from "react";
import sinon from "sinon";
import AntdConfig from "react-awesome-query-builder/config/antd";
import AntdWidgets from "react-awesome-query-builder/components/widgets/antd";
const {
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
} = AntdWidgets;
import { BasicFuncs } from "react-awesome-query-builder";


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
          return (val.length < 10 && (val === "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
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


export const with_theme_material = (BasicConfig) => ({
  ...with_all_types(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    theme: {
      material: {
        palette: {
          primary: {
            main: "#5e00d7",
          },
          secondary: {
            main: "#edf2ff",
          },
        },
      }
    },
  }
});
  
export const with_select = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    // new format of listValues
    color: {
      label: "Color",
      type: "select",
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" },
        ],
      }
    },
    // old format of listValues
    color2: {
      label: "Color2",
      type: "select",
      fieldSettings: {
        listValues: {
          yellow: "Yellow",
          green: "Green",
          orange: "Orange",
        },
      }
    },
    multicolor: {
      label: "Colors",
      type: "multiselect",
      fieldSettings: {
        listValues: {
          yellow: "Yellow",
          green: "Green",
          orange: "Orange"
        },
        allowCustomValues: false
      }
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
      mode: "struct",
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
  },
  settings: {
    ...BasicConfig.settings,
  }
});

export const with_group_struct = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    results: {
      label: "Results",
      type: "!group",
      mode: "struct",
      subfields: {
        grade: {
          type: "text",
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
  }
});

export const with_group_some = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    results: {
      label: "Results",
      type: "!group",
      mode: "some",
      subfields: {
        grade: {
          type: "text",
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
  }
});

export const with_group_array = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    results: {
      label: "Results",
      type: "!group",
      mode: "array",
      subfields: {
        grade: {
          type: "text",
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
  }
});

export const with_nested_group = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    results: {
      label: "Results",
      type: "!group",
      mode: "some",
      subfields: {
        score: {
          type: "number",
        },
        user: {
          type: "!group",
          mode: "some",
          subfields: {
            name: {
              type: "text",
            }
          }
        }
      }
    },
    group2: {
      label: "Group2",
      type: "!group",
      mode: "some",
      subfields: {
        inside: {
          type: "number",
        },
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
  }
});
  
export const with_struct_inside_group = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    results: {
      label: "Results",
      type: "!group",
      mode: "some",
      subfields: {
        score: {
          type: "number",
        },
        user: {
          type: "!struct",
          subfields: {
            name: {
              type: "text",
            },
            age: {
              type: "number",
            }
          }
        },
        quiz: {
          type: "!struct",
          subfields: {
            name: {
              type: "text",
            },
            max_score: {
              type: "number",
            }
          }
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
  }
});

export const with_group_inside_struct = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    vehicles: {
      label: "Vehicles",
      type: "!struct",
      subfields: {
        cars: {
          label: "Cars",
          type: "!group",
          mode: "some",
          subfields: {
            vendor: {
              type: "select",
              fieldSettings: {
                listValues: ["Ford", "Toyota", "Tesla"],
              },
              valueSources: ["value"],
            },
            year: {
              type: "number",
              fieldSettings: {
                min: 1990,
                max: 2021,
              },
              valueSources: ["value"],
            }
          }
        },
        bikes: {
          label: "Bikes",
          type: "!group",
          mode: "some",
          subfields: {
            price: {
              type: "number",
              valueSources: ["value"],
            },
            type: {
              type: "select",
              fieldSettings: {
                listValues: ["Road", "Mountain"],
              },
              valueSources: ["value"],
            },
          }
        },
        other: {
          type: "text",
          valueSources: ["value"],
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
  }
});

export const with_group_and_struct_deep = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    vehicles: {
      label: "Vehicles",
      type: "!struct",
      subfields: {
        cars: {
          label: "Cars",
          type: "!group",
          mode: "some",
          subfields: {
            manufactured: {
              label: "Manufactured",
              type: "!struct",
              subfields: {
                vendor: {
                  type: "select",
                  fieldSettings: {
                    listValues: ["Ford", "Toyota", "Tesla"],
                  },
                },
                type: {
                  label: "Type",
                  type: "!group",
                  mode: "some",
                  subfields: {
                    segment: {
                      label: "Segment",
                      type: "select",
                      fieldSettings: {
                        listValues: ["A", "B", "C", "D", "E"],
                      },
                    },
                    class: {
                      label: "Class",
                      type: "select",
                      fieldSettings: {
                        listValues: ["Mid", "Cabriolet", "Offroad"],
                      },
                    }
                  }
                }
              }
            }
          }
        },
        other: {
          type: "text",
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
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
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" },
        ],
      }
    },
    multicolor: {
      label: "Colors",
      type: "multiselect",
      fieldSettings: {
        listValues: {
          yellow: "Yellow",
          green: "Green",
          orange: "Orange"
        },
        allowCustomValues: false
      }
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
        ],
        customProps: {
          treeCheckStrictly: true
        }
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

export const simple_with_number_max_nesting_1 = (BasicConfig) => ({
  ...simple_with_number(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    maxNesting: 1,
  }
});

export const with_all_types__show_error = (BasicConfig) => ({
  ...with_all_types(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    showErrorMessage: true,
  }
});

export const dont_leave_empty_group = (BasicConfig) => ({
  ...simple_with_numbers_and_str(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    canLeaveEmptyGroup: false,
    shouldCreateEmptyGroup: false
  }
});

export const with_funcs = (BasicConfig) => ({
  ...BasicConfig,
  funcs: {
    ...BasicFuncs,
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
          label2: "User's login",
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

export const with_wrong_type = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      type: "not-a-text",
    },
  },
});

export const with_settings_confirm = (BasicConfig) => ({
  ...simple_with_number(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    removeRuleConfirmOptions: {
      title: "Are you sure delete this rule?",
      okText: "Yes",
      okType: "danger",
    },
    removeGroupConfirmOptions: {
      title: "Are you sure delete this group?",
      okText: "Yes",
      okType: "danger",
    },
    renderConfirm: sinon.spy(),
    /*({onOk, okText, cancelText, title}) => {
      if (confirm(title)) {
        onOk();
      }
    }*/
  }
});

export const with_settings_not_show_not = (BasicConfig) => ({
  ...simple_with_number(BasicConfig),
  conjunctions: {
    AND: BasicConfig.conjunctions.AND,
  },
  settings: {
    ...BasicConfig.settings,
    showNot: false
  }
});

export const with_settings_max_number_of_rules_3 = (BasicConfig) => ({
  ...simple_with_number(BasicConfig),
  settings: {
    ...BasicConfig.settings,
    maxNumberOfRules: 3
  }
});


export const with_group_array_cars = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    str: {
      label: "String",
      type: "text",
    },
    cars: {
      label: "Cars",
      type: "!group",
      mode: "array",
      conjunctions: ["AND", "OR"],
      showNot: true,
      operators: [
        // w/ operand - count
        "equal",
        "not_equal",
        "less",
        "less_or_equal",
        "greater",
        "greater_or_equal",
        "between",
        "not_between",

        // w/o operand
        "some",
        "all",
        "none",
      ],
      defaultOperator: "some",
      initialEmptyWhere: true, // if default operator is not in config.settings.groupOperators, true - to set no children, false - to add 1 empty

      subfields: {
        vendor: {
          type: "select",
          fieldSettings: {
            listValues: ["Ford", "Toyota", "Tesla"],
          },
          valueSources: ["value"],
        },
        year: {
          type: "number",
          fieldSettings: {
            min: 1990,
            max: 2021,
          },
          valueSources: ["value"],
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
  }
});

export const with_group_array_custom_operator = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    str: {
      label: "String",
      type: "text",
    },
    cars: {
      label: "Cars",
      type: "!group",
      mode: "array",
      conjunctions: ["AND", "OR"],
      showNot: true,
      operators: [
        "custom_group_operator"
      ],
      defaultOperator: "some",
      initialEmptyWhere: true, // if default operator is not in config.settings.groupOperators, true - to set no children, false - to add 1 empty

      subfields: {
        vendor: {
          type: "select",
          fieldSettings: {
            listValues: ["Ford", "Toyota", "Tesla"],
          },
          valueSources: ["value"],
        },
        year: {
          type: "number",
          fieldSettings: {
            min: 1990,
            max: 2021,
          },
          valueSources: ["value"],
        }
      }
    },
  },
  settings: {
    ...BasicConfig.settings,
    groupOperators: [...BasicConfig.settings.groupOperators, "custom_group_operator"]
  },
  operators: {
    ...BasicConfig.operators,
    custom_group_operator: {
      label: "custom_group_operator",
      labelForFormat: "custom_group_operator",
      cardinality: 0,
      jsonLogic: "custom_group_operator",
    },
  }
});

// rare
export const with_fieldName = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      fieldName: "state.input.num",
      label: "Number",
      type: "number",
    },
  },
});

// rare
export const with_groupVarKey = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    results: {
      label: "Results",
      type: "!group",
      mode: "some",
      subfields: {
        score: {
          type: "number",
        },
      }
    },
    stock: {
      label: "In stock",
      type: "boolean",
      jsonLogicVar: "shortcut",
    },
  },
  settings: {
    ...BasicConfig.settings,
    jsonLogic: {
      groupVarKey: "varValues",
      altVarKey: "shortcut",
    }
  }
});
