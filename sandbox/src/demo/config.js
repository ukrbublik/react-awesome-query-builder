import React from 'react';
import merge from 'lodash/merge';
import { Widgets, Operators, BasicConfig } from 'react-awesome-query-builder';
import en_US from 'antd/lib/locale-provider/en_US';
import ru_RU from 'antd/lib/locale-provider/ru_RU';
const {
    FieldSelect,
    FieldDropdown,
    FieldCascader,
    FieldTreeSelect,
    VanillaFieldSelect
  } = Widgets;

const conjunctions = {
    ...BasicConfig.conjunctions
};

const operators = {
    ...BasicConfig.operators,
    // examples of  overriding
    between: {
        ...BasicConfig.operators.between,
        valueLabels: [
            'Value from',
            'Value to'
        ],
        textSeparators: [
            'from',
            'to'
        ],
    },
    proximity: {
        ...BasicConfig.operators.proximity,
        valueLabels: [
            { label: 'Word 1', placeholder: 'Enter first word' },
            { label: 'Word 2', placeholder: 'Enter second word' },
        ],
        textSeparators: [
            //'Word 1',
            //'Word 2'
        ],
        options: {
            ...BasicConfig.operators.proximity.options,
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
    },
};

const widgets = {
    ...BasicConfig.widgets,
    // examples of  overriding
    text: {
        ...BasicConfig.widgets.text,
        validateValue: (val, fieldDef) => {
            return (val.length < 10);
        },
    },
    slider: {
        ...BasicConfig.widgets.slider,
        customProps: {
            width: '300px'
        }
    },
    rangeslider: {
        ...BasicConfig.widgets.rangeslider,
        customProps: {
            width: '300px'
        }
    },
    date: {
        ...BasicConfig.widgets.date,
        dateFormat: 'DD.MM.YYYY',
        valueFormat: 'YYYY-MM-DD',
    },
    time: {
        ...BasicConfig.widgets.time,
        timeFormat: 'HH:mm',
        valueFormat: 'HH:mm:ss',
    },
    datetime: {
        ...BasicConfig.widgets.datetime,
        timeFormat: 'HH:mm',
        dateFormat: 'DD.MM.YYYY',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    func: {
        ...BasicConfig.widgets.func,
        customProps: {
            showSearch: true
        }
    },
    treeselect: {
        ...BasicConfig.widgets.treeselect,
        customProps: {
            showSearch: true
        }
    },
};


const types = {
    ...BasicConfig.types,
    // examples of  overriding
    boolean: merge(BasicConfig.types.boolean, {
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


const localeSettings = {
    locale: {
        short: 'ru',
        full: 'ru-RU',
        antd: ru_RU,
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
    delGroupLabel: null,
    notLabel: "Not",
    valueSourcesPopupTitle: "Select value source",
    removeRuleConfirmOptions: {
        title: 'Are you sure delete this rule?',
        okText: 'Yes',
        okType: 'danger',
    },
    removeGroupConfirmOptions: {
        title: 'Are you sure delete this group?',
        okText: 'Yes',
        okType: 'danger',
    },
  };

const settings = {
    ...BasicConfig.settings,
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
    // canReorder: true,
    // canRegroup: true,
    // showNot: true,
    // showLabels: true,
    maxNesting: 3,
    canLeaveEmptyGroup: true, //after deletion
    // renderField: (props) => <FieldCascader {...props} />,
    renderOperator: (props) => <FieldDropdown {...props} />,
    renderFunc: (props) => <FieldSelect {...props} />,
};

//////////////////////////////////////////////////////////////////////

const fields = {
    user: {
        label: 'User',
        tooltip: 'Group of fields',
        type: '!struct',
        subfields: {
            firstName: {
                label2: 'Username', //only for menu's toggler
                type: 'text',
                excludeOperators: ['proximity'],
                mainWidgetProps: {
                    valueLabel: "Name",
                    valuePlaceholder: "Enter name",
                    validateValue: (val, fieldDef) => {
                        return (val.length < 10);
                    },
                },
            },
            login: {
                type: 'text',
                tableName: 't1', // PR #18, PR #20
                excludeOperators: ['proximity'],
                mainWidgetProps: {
                    valueLabel: "Login",
                    valuePlaceholder: "Enter login",
                    validateValue: (val, fieldDef) => {
                        return (val.length < 10 && (val == "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
                    },
                },
            }
        }
    },
    prox1: {
        label: 'prox',
        tooltip: 'Proximity search',
        type: 'text',
        operators: ['proximity'],
    },
    num: {
        label: 'Number',
        type: 'number',
        preferWidgets: ['number'],
        fieldSettings: {
            min: -1,
            max: 5
        },
        funcs: ['LINEAR_REGRESSION'],
    },
    slider: {
        label: 'Slider',
        type: 'number',
        preferWidgets: ['slider', 'rangeslider'],
        valueSources: ['value', 'field'],
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
    date: {
        label: 'Date',
        type: 'date',
        valueSources: ['value'],
    },
    time: {
        label: 'Time',
        type: 'time',
        valueSources: ['value'],
        operators: ['greater_or_equal', 'less_or_equal', 'between'],
        defaultOperator: 'between',
    },
    datetime: {
        label: 'DateTime',
        type: 'datetime',
        valueSources: ['value']
    },
    datetime2: {
        label: 'DateTime2',
        type: 'datetime',
        valueSources: ['field']
    },
    color: {
        label: 'Color',
        type: 'select',
        valueSources: ['value'],
        // * old format:
        // listValues: {
        //     yellow: 'Yellow',
        //     green: 'Green',
        //     orange: 'Orange'
        // },
        // * new format:
        listValues: [
            { value: 'yellow', title: 'Yellow' },
            { value: 'green', title: 'Green' },
            { value: 'orange', title: 'Orange' }
        ],
    },
    color2: {
        label: 'Color2',
        type: 'select',
        listValues: {
            yellow: 'Yellow',
            green: 'Green',
            orange: 'Orange',
            purple: 'Purple'
        },
    },
    multicolor: {
        label: 'Colors',
        type: 'multiselect',
        listValues: {
            yellow: 'Yellow',
            green: 'Green',
            orange: 'Orange'
        },
        allowCustomValues: true
    },
    selecttree: {
        label: 'Color (tree)',
        type: 'treeselect',
        fieldSettings: {
            treeExpandAll: true,
            // * deep format (will be auto converted to flat format):
            // listValues: [
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
        label: 'Colors (tree)',
        type: 'treemultiselect',
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
    stock: {
        label: 'In stock',
        type: 'boolean',
        defaultValue: true,
        fieldSettings: {
            labelYes: "+",
            labelNo: "-"
        }
    },
};

//////////////////////////////////////////////////////////////////////

const funcs = {
    LOWER: {
        label: 'Lowercase',
        mongoFunc: '$toLower',
        jsonLogic: ({str}) => ({ "method": [ str, "toLowerCase" ] }),
        returnType: 'text',
        args: {
            str: {
                label: "String",
                type: 'text',
                valueSources: ['value', 'field'],
            },
        }
    },
    LINEAR_REGRESSION: {
        label: 'Linear regression',
        returnType: 'number',
        formatFunc: ({coef, bias, val}, _) => `(${coef} * ${val} + ${bias})`,
        sqlFormatFunc: ({coef, bias, val}) => `(${coef} * ${val} + ${bias})`,
        mongoFormatFunc: ({coef, bias, val}) => ({'$sum': [{'$multiply': [coef, val]}, bias]}),
        jsonLogic: ({coef, bias, val}) => ({ "+": [ {"*": [coef, val]}, bias ] }),
        renderBrackets: ['', ''],
        renderSeps: [' * ', ' + '],
        args: {
            coef: {
                label: "Coef",
                type: 'number',
                defaultValue: 1,
                valueSources: ['value'],
            },
            val: {
                label: "Value",
                type: 'number',
                valueSources: ['value'],
            },
            bias: {
                label: "Bias",
                type: 'number',
                defaultValue: 0,
                valueSources: ['value'],
            }
        }
    },
};


export default {
    conjunctions,
    operators,
    widgets,
    types,
    settings,
    fields,
    funcs,
};

