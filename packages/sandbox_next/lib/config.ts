/*eslint @typescript-eslint/no-unused-vars: ["off", {"varsIgnorePattern": "^_"}]*/
import merge from "lodash/merge";
import {
  Utils, BasicFuncs, CoreConfig,
  // types:
  Settings, Operators, Widgets, Fields, Config, Types, Conjunctions, LocaleSettings, Funcs, OperatorProximity,
} from "@react-awesome-query-builder/core";



export function createConfig(InitialConfig: CoreConfig): Config {

  const fields: Fields = {
    user: {
      label: "User",
      tooltip: "Group of fields",
      type: "!struct",
      subfields: {
        firstName: {
          label2: "Username", //only for menu's toggler
          type: "text",
          excludeOperators: ["proximity"],
          mainWidgetProps: {
            valueLabel: "Name",
            valuePlaceholder: "Enter name",
          },
          fieldSettings: {
            validateValue: (val: string, fieldSettings) => {
              return (val.length < 10);
            },
          },
        },
        login: {
          type: "text",
          excludeOperators: ["proximity"],
          fieldSettings: {
            validateValue: (val: string, fieldSettings) => {
              return (val.length < 10 && (val === "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
            },
          },
          mainWidgetProps: {
            valueLabel: "Login",
            valuePlaceholder: "Enter login",
          },
        }
      }
    },
    prox1: {
      label: "prox",
      tooltip: "Proximity search",
      type: "text",
      operators: ["proximity"],
    },
    num: {
      label: "Number",
      type: "number",
      preferWidgets: ["number"],
      fieldSettings: {
        min: -1,
        max: 5
      },
      funcs: ["LINEAR_REGRESSION"],
    },
    slider: {
      label: "Slider",
      type: "number",
      preferWidgets: ["slider", "rangeslider"],
      valueSources: ["value", "field"],
      fieldSettings: {
        min: 0,
        max: 100,
        step: 1,
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
    date: {
      label: "Date",
      type: "date",
      valueSources: ["value"],
    },
    time: {
      label: "Time",
      type: "time",
      valueSources: ["value"],
      operators: ["greater_or_equal", "less_or_equal", "between"],
      defaultOperator: "between",
    },
    datetime: {
      label: "DateTime",
      type: "datetime",
      valueSources: ["value"]
    },
    datetime2: {
      label: "DateTime2",
      type: "datetime",
      valueSources: ["field"]
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" }
        ],
      }
    },
    color2: {
      label: "Color2",
      type: "select",
      fieldSettings: {
        listValues: {
          yellow: "Yellow",
          green: "Green",
          orange: "Orange",
          purple: "Purple"
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
        allowCustomValues: true
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
    autocomplete: {
      label: "Autocomplete",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        useAsyncSearch: true,
        useLoadMore: true,
        forceAsyncSearch: false,
        allowCustomValues: false
      },
    },
    autocompleteMultiple: {
      label: "AutocompleteMultiple",
      type: "multiselect",
      valueSources: ["value"],
      fieldSettings: {
        useAsyncSearch: true,
        useLoadMore: true,
        forceAsyncSearch: false,
        allowCustomValues: false
      },
    },
  };


  //////////////////////////////////////////////////////////////////////

  const conjunctions: Conjunctions = {
    AND: InitialConfig.conjunctions.AND,
    OR: InitialConfig.conjunctions.OR,
  };


  const proximity: OperatorProximity = {
    ...InitialConfig.operators.proximity,
    valueLabels: [
      { label: "Word 1", placeholder: "Enter first word" },
      { label: "Word 2", placeholder: "Enter second word" },
    ],
    textSeparators: [
      //'Word 1',
      //'Word 2'
    ],
    options: {
      ...InitialConfig.operators.proximity.options,
      optionLabel: "Near", // label on top of "near" selectbox (for config.settings.showLabels==true)
      optionTextBefore: "Near", // label before "near" selectbox (for config.settings.showLabels==false)
      optionPlaceholder: "Select words between", // placeholder for "near" selectbox
      minProximity: 2,
      maxProximity: 10,
      defaults: {
        proximity: 2
      },
      customProps: {}
    }
  };

  const operators: Operators = {
    ...InitialConfig.operators,
    // examples of  overriding
    between: {
      ...InitialConfig.operators.between,
      valueLabels: [
        "Value from",
        "Value to"
      ],
      textSeparators: [
        "from",
        "to"
      ],
    },
    proximity,
  };

  const widgets: Widgets = {
    ...InitialConfig.widgets,
    // examples of  overriding
    text: {
      ...InitialConfig.widgets.text,
    },
    slider: {
      ...InitialConfig.widgets.slider,
      customProps: {
        width: "300px"
      }
    },
    rangeslider: {
      ...InitialConfig.widgets.rangeslider,
      customProps: {
        width: "300px"
      }
    },
    date: {
      ...InitialConfig.widgets.date,
      dateFormat: "DD.MM.YYYY",
      valueFormat: "YYYY-MM-DD",
    },
    time: {
      ...InitialConfig.widgets.time,
      timeFormat: "HH:mm",
      valueFormat: "HH:mm:ss",
    },
    datetime: {
      ...InitialConfig.widgets.datetime,
      timeFormat: "HH:mm",
      dateFormat: "DD.MM.YYYY",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
    },
    func: {
      ...InitialConfig.widgets.func,
      customProps: {
        showSearch: true
      }
    },
    treeselect: {
      ...InitialConfig.widgets.treeselect,
      customProps: {
        showSearch: true
      }
    },
  };


  const types: Types = {
    ...InitialConfig.types,
    // examples of  overriding
    boolean: merge(InitialConfig.types.boolean, {
      widgets: {
        boolean: {
          widgetProps: {
            hideOperator: true,
            operatorInlineLabel: "is",
          }
        },
      },
    }),
  };


  const localeSettings: LocaleSettings = {
    locale: {
      moment: "ru",
    },
    valueLabel: "Value",
    valuePlaceholder: "Value",
    fieldLabel: "Field",
    operatorLabel: "Operator",
    fieldPlaceholder: "Select field",
    operatorPlaceholder: "Select operator",
    deleteLabel: null,
    addGroupLabel: "Add group",
    addRuleLabel: "Add rule",
    addSubRuleLabel: "Add sub rule",
    delGroupLabel: null,
    notLabel: "Not",
    valueSourcesPopupTitle: "Select value source",
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
  };

  const settings: Settings = {
    ...InitialConfig.settings,
    ...localeSettings,

    valueSourcesInfo: {
      value: {
        label: "Value"
      },
      field: {
        label: "Field",
        widget: "field",
      },
      func: {
        label: "Function",
        widget: "func",
      }
    },
    // canReorder: false,
    // canRegroup: false,
    // showNot: false,
    // showLabels: true,
    maxNesting: 3,
    canLeaveEmptyGroup: true, //after deletion
  };


  const funcs: Funcs = {
    LINEAR_REGRESSION: BasicFuncs.LINEAR_REGRESSION,
    LOWER: BasicFuncs.LOWER,
  };

  const config: Config = {
    conjunctions,
    operators,
    widgets,
    types,
    settings,
    fields,
    funcs
  };

  return config;
}

export default createConfig(CoreConfig);
