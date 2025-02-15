/*eslint @typescript-eslint/no-unused-vars: ["off", {"varsIgnorePattern": "^_"}]*/
import merge from "lodash/merge";
import {
  BasicFuncs, CoreConfig,
  // types:
  Settings, Operators, Widgets, Fields, Config, Types, Conjunctions, LocaleSettings, Funcs, OperatorProximity, Func, SerializedFunction, PriceFieldSettings,
} from "@react-awesome-query-builder/core";

// Create a config for demo app based on CoreConfig - add fields, funcs, some overrides.
// Additional UI modifications are done in `./config` (like `asyncFetch`, `marks`, `factory`)
//
//   ! Important !
//   Don't use JS functions in config, since it can't be used with SSR.
//   Instead add function to `ctx` and refer to it with a name, see `validateFirstName`.
//   Or use JsonLogic functions, see `validateValue` for `login` field (advanced usage, but doesn't change `ctx`).

function createConfig(InitialConfig: CoreConfig): Config {

  const fields: Fields = {
    user: {
      label: "User",
      tooltip: "Group of fields",
      type: "!struct",
      subfields: {
        firstName: {
          label2: "Username",
          type: "text",
          excludeOperators: ["proximity"],
          mainWidgetProps: {
            valueLabel: "Name",
            valuePlaceholder: "Enter name",
          },
          fieldSettings: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            validateValue: "validateFirstName" as SerializedFunction as any,
            // -or-
            // validateValue: {
            //   "<": [ {strlen: {var: "val"}}, 10 ]
            // },
            // -incorrect-
            // validateValue: (val: string) => {
            //   return (val.length < 10);
            // },
          },
        },
        login: {
          type: "text",
          excludeOperators: ["proximity"],
          fieldSettings: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            validateValue: {
              and: [
                { "<": [ {strlen: {var: "val"}}, 10 ] },
                { or: [
                  { "===": [ {var: "val"}, "" ] },
                  { regexTest: [ {var: "val"}, "^[A-Za-z0-9_-]+$" ] }
                ]}
              ]
            } as SerializedFunction as any
            // -incorrect-
            // (val: string) => {
            //   return (val.length < 10 && (val === "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
            // },
          },
          mainWidgetProps: {
            valueLabel: "Login",
            valuePlaceholder: "Enter login",
          },
        }
      }
    },
    price: {
      label: "Price",
      type: "price",
      preferWidgets: ["price"],
      fieldSettings: {
        valuePlaceholder: "Enter your Price",
        thousandSeparator:",",
        prefix:'﷼',
        suffix:'$',
      }as PriceFieldSettings,
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
    boolean: merge({}, InitialConfig.types.boolean, {
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
    addSubGroupLabel: "Add sub group",
    delGroupLabel: null,
    notLabel: "Not",
    fieldSourcesPopupTitle: "Select source",
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

    useConfigCompress: true,
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
    fieldSources: ["field", "func"],
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

  //  ! Important !
  //  Context is not saved to compressed config (zipConfig).
  //  You must provide `ctx` to `ConfigUtils.decompressConfig()`.
  //  `validateFirstName` should be defined in `components/demo/config_ctx` for using on client-side.
  //  Implementation here is used for server-side validation.
  const ctx = {
    ...InitialConfig.ctx,
    validateFirstName: (val: string) => {
      return (val.length < 10);
    },
  };

  const config: Config = {
    conjunctions,
    operators,
    widgets,
    types,
    settings,
    fields,
    funcs,
    ctx
  };

  return config;
}

export default createConfig(CoreConfig);
