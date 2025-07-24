import React, { Component } from "react";
import merge from "lodash/merge";
import {
  BasicFuncs, Utils, BasicConfig,
  // types:
  Operators, Fields, Func, Types, Conjunctions, LocaleSettings, OperatorProximity, Funcs, DateTimeWidget, FuncWidget, SelectWidget, 
  Settings,
  DateTimeFieldSettings, TextFieldSettings, SelectFieldSettings, MultiSelectFieldSettings, NumberFieldSettings,
  TextWidgetProps,
  WidgetProps,
  Widgets,
  TextWidget,
  TreeSelectWidget,
  Config,
  ValidateValue,
} from "@react-awesome-query-builder/ui";
import { AntdWidgets } from "@react-awesome-query-builder/antd";
import moment from "moment";
import ru_RU from "antd/es/locale/ru_RU";
import { ruRU } from "@material-ui/core/locale";
import { ruRU as muiRuRU } from "@mui/material/locale";
import { skinToConfig } from "../../skins";

const {
  FieldSelect,
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
} = AntdWidgets;
const { simulateAsyncFetch } = Utils.Autocomplete;


export default (skin: string) => {
  const originalConfig = skinToConfig[skin] as BasicConfig;
  const InitialConfig = originalConfig as BasicConfig;

  const demoListValues = [
    { title: "A", value: "a" },
    { title: "AA", value: "aa" },
    { title: "AAA1", value: "aaa1" },
    { title: "AAA2", value: "aaa2" },
    { title: "B", value: "b" },
    { title: "C", value: "c" },
    { title: "D", value: "d" },
    { title: "E", value: "e" },
    { title: "F", value: "f" },
    { title: "G", value: "g" },
    { title: "H", value: "h" },
    { title: "I", value: "i" },
    { title: "J", value: "j" },
  ];
  const simulatedAsyncFetch = simulateAsyncFetch(demoListValues, 3);

  const conjunctions: Conjunctions = {
    ...InitialConfig.conjunctions,
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
    proximity,
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
  };


  const widgets: Widgets = {
    ...InitialConfig.widgets,
    // examples of overriding
    text: {
      ...InitialConfig.widgets.text
    },
    textarea: {
      ...InitialConfig.widgets.textarea,
      maxRows: 3
    },
    slider: {
      ...InitialConfig.widgets.slider,
    },
    price: {
      ...InitialConfig.widgets.price,
    },
    rangeslider: {
      ...InitialConfig.widgets.rangeslider
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
    select: {
      ...InitialConfig.widgets.select,
    },
    multiselect: {
      ...InitialConfig.widgets.multiselect,
      customProps: {
        //showCheckboxes: false,
        width: "200px",
        input: {
          width: "100px"
        }
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
    text: {
      ...InitialConfig.types.text,
      excludeOperators: ["proximity"],
    },
    boolean: merge({}, InitialConfig.types.boolean, {
      widgets: {
        boolean: {
          widgetProps: {
            hideOperator: true,
            operatorInlineLabel: "is"
          },
          opProps: {
            equal: {
              label: "is"
            },
            not_equal: {
              label: "is not"
            }
          }
        },
      },
    }),
  };


  const localeSettings: LocaleSettings = {
    locale: {
      moment: "ru",
      antd: ru_RU,
      material: ruRU,
      mui: muiRuRU
    },
    valueLabel: "Value",
    valuePlaceholder: "Value",
    fieldLabel: "Field",
    operatorLabel: "Operator",
    funcLabel: "Function",
    fieldPlaceholder: "Select field",
    funcPlaceholder: "Select function",
    operatorPlaceholder: "Select operator",
    lockLabel: "Lock",
    lockedLabel: "Locked",
    deleteLabel: undefined,
    addGroupLabel: "Add group",
    addRuleLabel: "Add rule",
    addSubRuleLabel: "Add sub rule",
    addSubGroupLabel: "Add sub group",
    delGroupLabel: undefined,
    notLabel: "Not",
    fieldSourcesPopupTitle: "Select source",
    valueSourcesPopupTitle: "Select value source",
    removeRuleConfirmOptions: {
      title: "Are you sure delete this rule?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel"
    },
    removeGroupConfirmOptions: {
      title: "Are you sure delete this group?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel"
    },
    loadMoreLabel: "Load more...",
    loadingMoreLabel: "Loading more...",
    typeToSearchLabel: "Type to search",
    loadingLabel: "Loading...",
    notFoundLabel: "Not found",
  };

  const settings: Settings = {
    ...InitialConfig.settings,
    ...localeSettings,

    theme: {
      // material: {
      //   palette: {
      //     primary: {
      //       main: "rgb(255, 51, 51)",
      //     },
      //   },
      // },
      // mui: {
      //   palette: {
      //     primary: {
      //       main: "rgb(255, 87, 51)",
      //     },
      //   },
      // },
      // antd: {
      //   token: {
      //     colorPrimary: "rgb(255, 51, 51)",
      //   }
      // },
      // fluent: {
      //   palette: {
      //     themePrimary: "rgb(255, 51, 51)",
      //   },
      // },
    },

    designSettings: {
      ...InitialConfig.settings.designSettings,
      useThickLeftBorderOnHoverItem: true,
      useShadowOnHoverItem: false,
      generateCssVarsFromThemeLibrary: true, // false to use design like in < 6.7
      generateCssVars: {
        // example of overriding
        mui: function (theme, config) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            ...(config.ctx.generateCssVars?.(theme, config) ?? {}),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            "--item-offset": "8px",
          };
        },
      }
    },

    defaultSliderWidth: "200px",
    defaultSelectWidth: "200px",
    defaultSearchWidth: "100px",
    defaultMaxRows: 5,

    // Example of how to correctly configure default LHS funtion with args:
    // defaultField: {
    //   func: "datetime.RELATIVE_DATETIME",
    //   args: {
    //     date: {
    //       value: {func: "datetime.NOW", args: {}},
    //       valueSrc: "func"
    //     },
    //     op: {
    //       value: "plus",
    //       valueSrc: "value"
    //     },
    //     dim: {
    //       value: "day",
    //       valueSrc: "value"
    //     },
    //     val: {
    //       value: 1,
    //       valueSrc: "value"
    //     }
    //   }
    // },

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
    keepInputOnChangeFieldSrc: true,
    reverseOperatorsForNot: true,
    canShortMongoQuery: true,
    fixJsonLogicDateCompareOp: true,
    exportPreserveGroups: false,
    // canReorder: true,
    // canRegroup: true,
    // showLock: true,
    // showNot: true,
    // showLabels: true,
    maxNesting: 5,
    canLeaveEmptyGroup: true,
    shouldCreateEmptyGroup: false,
    showErrorMessage: true,
    removeEmptyGroupsOnLoad: false,
    removeEmptyRulesOnLoad: false,
    removeIncompleteRulesOnLoad: false,
    customFieldSelectProps: {
      showSearch: true
    },
    customOperatorSelectProps: {
      // showSearch: true
    },
    // renderField: (props) => <FieldCascader {...props} />,
    // renderOperator: (props) => <FieldDropdown {...props} />,
    // renderFunc: (props) => <FieldSelect {...props} />,
    // maxNumberOfRules: 10 // number of rules can be added to the query builder

    // defaultField: "user.firstName",
    // defaultOperator: "starts_with",

    // canCompareFieldWithField: (leftField, leftFieldConfig, rightField, rightFieldConfig, op) => {
    //   if (leftField === 'slider' && rightField === 'results.score') {
    //     return false;
    //   }
    //   return true;
    // }

    // enable ternary mode with number as case value
    caseValueField: {
      // mainWidgetProps: {
      //   valueLabel: "Then",
      //   valuePlaceholder: "Then",
      // },
      type: "number",
      fieldSettings: {
        min: 0,
        max: 10,
      },
      valueSources: ["value", "field", "func"],
    },
  };

  //////////////////////////////////////////////////////////////////////

  const fields: Fields = {
    age: {
      label: "Age",
      type: "number",
      fieldSettings: {
        min: 0,
        max: 120,
      }
    },
    user: {
      label: "User",
      tooltip: "Group of fields",
      type: "!struct",
      subfields: {
        firstName: {
          label2: "Username", //only for menu's toggler
          type: "text",
          fieldSettings: {
            validateValue: (val, fieldSettings) => {
              return (val.length < 10);
            },
          } as TextFieldSettings,
          mainWidgetProps: {
            valueLabel: "Name",
            valuePlaceholder: "Enter name",
          },
        },
        login: {
          type: "text",
          tableName: "t1", // legacy: PR #18, PR #20
          fieldSettings: {
            validateValue: (val, fieldSettings) => {
              return (val.length < 10 && (val === "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
            },
          } as TextFieldSettings,
          mainWidgetProps: {
            valueLabel: "Login",
            valuePlaceholder: "Enter login",
          },
        }
      }
    },
    bio: {
      label: "Bio",
      type: "text",
      preferWidgets: ["textarea"],
      fieldSettings: {
        maxLength: 1000,
      }
    },
    results: {
      label: "Results (group)",
      type: "!group",
      subfields: {
        product: {
          type: "select",
          fieldSettings: {
            listValues: ["abc", "def", "xyz"],
          } as SelectFieldSettings,
          valueSources: ["value"],
        },
        score: {
          type: "number",
          fieldSettings: {
            min: 0,
            max: 100,
          },
          valueSources: ["value"],
        },
        interviewer: {
          type: "!group",
          mode: "struct",
          subfields: {
            level: {
              type: "select",
              fieldSettings: {
                listValues: ["jun", "mid", "sen"],
              } as SelectFieldSettings,
              valueSources: ["value"],
            },
          }
        },
        questions: {
          type: "!group",
          mode: "array",
          conjunctions: ["AND", "OR"],
          showNot: false,
          initialEmptyWhere: true,
          defaultOperator: "equal",

          subfields: {
            answered: {
              type: "boolean",
              valueSources: ["value"],
            },
          }
        },
      }
    },
    cars: {
      label: "Cars (list)",
      type: "!group",
      mode: "array",
      conjunctions: ["AND", "OR"],
      showNot: false,
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
      //defaultField: "year",
      initialEmptyWhere: true, // if default operator is not in config.settings.groupOperators, true - to set no children, false - to add 1 empty

      fieldSettings: {
        validateValue: (val: number) => {
          return (val < 10 ? null : {error: "Too many cars, see validateValue()", fixedValue: 9});
        },
      },

      subfields: {
        vendor: {
          type: "select",
          fieldSettings: {
            listValues: ["Ford", "Toyota", "Tesla"],
          } as MultiSelectFieldSettings,
          valueSources: ["value"],
        },
        year: {
          type: "number",
          fieldSettings: {
            min: 1990,
            max: 2021,
          },
          valueSources: ["value"],
        },
        model: {
          type: "text",
          valueSources: ["value"],
        },
        class: {
          type: "!group",
          mode: "struct",
          subfields: {
            type: {
              type: "select",
              fieldSettings: {
                listValues: ["sedan", "hatchback", "minivan"],
              } as SelectFieldSettings,
              valueSources: ["value"],
            },
          }
        },
        items: {
          type: "!group",
          mode: "array",
          conjunctions: ["AND", "OR"],
          showNot: false,
          defaultOperator: "greater_or_equal",
          initialEmptyWhere: true,
          subfields: {
            color: {
              type: "select",
              listValues: [
                { value: "yellow", title: "Yellow" },
                { value: "green", title: "Green" },
                { value: "orange", title: "Orange" }
              ],
              valueSources: ["value"],
            },
          }
        },
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
      funcs: ["number.LINEAR_REGRESSION"],
    },
    price: {
      label: "Price",
      type: "number",
      preferWidgets: ["price"],
      fieldSettings: {
        valuePlaceholder: "Enter your Price",
        thousandSeparator: ",",
        decimalSeparator: ".",
        prefix: "$",
        decimalScale: 3,
        // allowLeadingZeros: true,
        // fixedDecimalScale: true,
        // allowNegative: true,
        min: 20,
        max: 30000,
      },
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
        marks: {
          0: <strong>0%</strong>,
          100: <strong>100%</strong>
        },
        validateValue: ((val, fieldSettings) => {
          const ret: ReturnType<ValidateValue> = (val < 50 ? null : {
            // error: "Invalid slider value, see validateValue()",
            error: {key: "custom:INVALID_SLIDER_VALUE", args: {val}},
            fixedValue: 49
          });
          return ret;
        }),
      } as NumberFieldSettings,
      //overrides
      widgets: {
        slider: {
          widgetProps: {
            valuePlaceholder: "..Slider",
          }
        },
        rangeslider: {
          widgetProps: {
            valueLabels: [
              { label: "Number from", placeholder: "from" },
              { label: "Number to", placeholder: "to" },
            ],
          }
        },
      },
    },
    date: {
      label: "Date",
      type: "date",
      valueSources: ["value", "func"],
      fieldSettings: {
        dateFormat: "DD-MM-YYYY",
        validateValue: (val, fieldSettings: DateTimeFieldSettings) => {
          // example of date validation
          const dateVal = moment(val, fieldSettings.valueFormat);
          return dateVal.year() != (new Date().getFullYear()) ? "Please use current year" : null;
        },
      } as DateTimeFieldSettings,
    },
    time: {
      label: "Time",
      type: "time",
      valueSources: ["value"],
      defaultOperator: "between",
    },
    datetime: {
      label: "DateTime",
      type: "datetime",
      valueSources: ["value", "func"]
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
      widgets: {
        select: {
          widgetProps: {
            valuePlaceholder: "Select color",
            searchPlaceholder: "Search color",
          },
        },
        multiselect: {
          widgetProps: {
            valuePlaceholder: "Select colors",
            searchPlaceholder: "Search colors",
          },
        },
      },
      fieldSettings: {
        showSearch: true,

        // * old format:
        // listValues: {
        //     yellow: 'Yellow',
        //     green: 'Green',
        //     orange: 'Orange'
        // },
        // * new format:
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" }
        ],
      },
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
        showSearch: true,
        listValues: {
          yellow: "Yellow",
          green: "Green",
          orange: "Orange"
        },
        allowCustomValues: true,
      },
      mainWidgetProps: {
        customProps: {
          tokenSeparators: [","]
        }
      }
    },
    selecttree: {
      label: "Color (tree)",
      type: "treeselect",
      fieldSettings: {
        treeExpandAll: true,
        // * deep format (will be auto converted to flat format):
        // treeValues: [
        //     { value: "1", title: "Warm colors", children: [
        //         { value: "2", title: "Red" },
        //         { value: "3", title: "Orange" }
        //     ] },
        //     { value: "4", title: "Cool colors", children: [
        //         { value: "5", title: "Green" },
        //         { value: "6", title: "Blue", children: [
        //             { value: "7", title: "Sub blue", children: [
        //                 { value: "8", title: "Sub sub blue and a long text" }
        //             ] }
        //         ] }
        //     ] }
        // ],
        // * flat format:
        treeValues: [
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
        treeValues: [
          {
            value: "1", title: "Warm colors", children: [
              { value: "2", title: "Red" },
              { value: "3", title: "Orange" }
            ]
          },
          {
            value: "4", title: "Cool colors", children: [
              { value: "5", title: "Green" },
              {
                value: "6", title: "Blue", children: [
                  {
                    value: "7", title: "Sub blue", children: [
                      { value: "8", title: "Sub sub blue and a long text" }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    autocomplete: {
      label: "Autocomplete",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        asyncFetch: simulatedAsyncFetch,
        useAsyncSearch: true,
        fetchSelectedValuesOnInit: true,
        useLoadMore: true,
        forceAsyncSearch: false,
        allowCustomValues: false
      } as SelectFieldSettings,
    },
    autocompleteMultiple: {
      label: "AutocompleteMultiple",
      type: "multiselect",
      valueSources: ["value"],
      fieldSettings: {
        asyncFetch: simulatedAsyncFetch,
        useAsyncSearch: true,
        fetchSelectedValuesOnInit: true,
        useLoadMore: true,
        forceAsyncSearch: false,
        allowCustomValues: false
      } as SelectFieldSettings,
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
  };

  //////////////////////////////////////////////////////////////////////

  const funcs: Funcs = {
    //...BasicFuncs
    string: {
      type: "!struct",
      label: "String",
      tooltip: "String functions",
      subfields: {
        // LOWER: max length - 7
        // UPPER: max length - 6
        LOWER: merge({}, BasicFuncs.LOWER, {
          tooltip: "Convert to lower case",
          allowSelfNesting: true,
          validateValue: (s: string) => {
            return s.length <= 7 ? null : {
              error: "bad len",
              fixedValue: s.substring(0, 7)
            };
          },
          args: {
            str: {
              validateValue: (s: string) => {
                return s.length <= 7 ? null : {
                  error: { key: "custom:BAD_LEN", args: {val: s} },
                  fixedValue: s.substring(0, 7)
                };
              }
            },
          }
        }),
        UPPER: merge({}, BasicFuncs.UPPER, {
          tooltip: "Convert to upper case",
          allowSelfNesting: true,
          validateValue: (s: string) => {
            return s.length <= 6 ? null : {
              error: "bad len",
              fixedValue: s.substring(0, 6)
            };
          },
          args: {
            str: {
              validateValue: (s: string) => {
                return s.length <= 6 ? null : {
                  error: { key: "custom:BAD_LEN", args: {val: s} },
                  fixedValue: s.substring(0, 6)
                };
              }
            },
          }
        }),
      }
    },
    datetime: {
      type: "!struct",
      label: "Datetime",
      subfields: {
        NOW: BasicFuncs.NOW,
        START_OF_TODAY: BasicFuncs.START_OF_TODAY,
        TRUNCATE_DATETIME: merge({}, BasicFuncs.TRUNCATE_DATETIME, {
          args: {
            date: {
              defaultValue: {func: "datetime.NOW", args: []},
            }
          }
        }),
        RELATIVE_DATETIME: merge({}, BasicFuncs.RELATIVE_DATETIME, {
          args: {
            date: {
              defaultValue: {func: "datetime.NOW", args: []},
            }
          }
        }),
      }
    },
    date: {
      type: "!struct",
      label: "Date",
      subfields: {
        TODAY: BasicFuncs.TODAY,
        RELATIVE_DATE: merge({}, BasicFuncs.RELATIVE_DATE, {
          args: {
            date: {
              defaultValue: {func: "date.TODAY", args: []},
            }
          }
        }),
      }
    },
    number: {
      type: "!struct",
      label: "Math",
      subfields: {
        LINEAR_REGRESSION: BasicFuncs.LINEAR_REGRESSION,
      }
    }
  };

  const ctx = InitialConfig.ctx;

  const config: Config = {
    ctx,
    conjunctions,
    operators,
    widgets,
    types,
    settings,
    fields,
    funcs,
  };

  return config;
};
