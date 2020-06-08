import React, {Component} from 'react';
import merge from 'lodash/merge';
import {
    BasicConfig,
    // types:
    Operators, Widgets, Fields, Config, Types, Conjunctions, Settings, LocaleSettings, OperatorProximity, Funcs,
} from 'react-awesome-query-builder';
import moment from 'moment';

import AntdConfig from 'react-awesome-query-builder/config/antd';
import AntdWidgets from 'react-awesome-query-builder/components/widgets/antd';
const {
    FieldSelect,
    FieldDropdown,
    FieldCascader,
    FieldTreeSelect,
} = AntdWidgets;

export default (skin) => {
    const InitialConfig = skin == "vanilla" ? BasicConfig : AntdConfig;

    const conjunctions: Conjunctions = {
        ...InitialConfig.conjunctions,
    };

    const proximity: OperatorProximity = {
        ...InitialConfig.operators.proximity,
        valueLabels: [
            { label: 'Word 1', placeholder: 'Enter first word' },
            { label: 'Word 2', placeholder: 'Enter second word' },
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
                'Value from',
                'Value to'
            ],
            textSeparators: [
                'from',
                'to'
            ],
        },
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
                width: '300px'
            }
        },
        rangeslider: {
            ...InitialConfig.widgets.rangeslider,
            customProps: {
                width: '300px'
            },
        },
        date: {
            ...InitialConfig.widgets.date,
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD',
        },
        time: {
            ...InitialConfig.widgets.time,
            timeFormat: 'HH:mm',
            valueFormat: 'HH:mm:ss',
        },
        datetime: {
            ...InitialConfig.widgets.datetime,
            timeFormat: 'HH:mm',
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
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
            short: 'ru',
            full: 'ru-RU',
            //import en_US from 'antd/lib/locale-provider/en_US';
            //import ru_RU from 'antd/lib/locale-provider/ru_RU';
            //antd: ru_RU,
        },
        valueLabel: "Value",
        valuePlaceholder: "Value",
        fieldLabel: "Field",
        operatorLabel: "Operator",
        funcLabel: "Function",
        fieldPlaceholder: "Select field",
        funcPlaceholder: "Select function",
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
        // canReorder: true,
        // canRegroup: true,
        // showNot: true,
        // showLabels: true,
        maxNesting: 3,
        canLeaveEmptyGroup: true, //after deletion
        showErrorMessage: true,
        // renderField: (props) => <FieldCascader {...props} />,
        // renderOperator: (props) => <FieldDropdown {...props} />,
        // renderFunc: (props) => <FieldSelect {...props} />,
    };

    //////////////////////////////////////////////////////////////////////

    const fields: Fields = {
        user: {
            label: 'User',
            tooltip: 'Group of fields',
            type: '!struct',
            subfields: {
                firstName: {
                    label2: 'Username', //only for menu's toggler
                    type: 'text',
                    excludeOperators: ['proximity'],
                    fieldSettings: {
                        validateValue: (val, fieldSettings) => {
                            return (val.length < 10);
                        },
                    },
                    mainWidgetProps: {
                        valueLabel: "Name",
                        valuePlaceholder: "Enter name",
                    },
                },
                login: {
                    type: 'text',
                    tableName: 't1', // PR #18, PR #20
                    excludeOperators: ['proximity'],
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
            }
        },
        results: {
            label: 'Results',
            type: '!group',
            subfields: {
                product: {
                    type: 'select',
                    fieldSettings: {
                        listValues: ['abc', 'def', 'xyz'],
                    },
                    valueSources: ['value'],
                },
                score: {
                    type: 'number',
                    fieldSettings: {
                        min: 0,
                        max: 100,
                    },
                    valueSources: ['value'],
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
                validateValue: (val, fieldSettings) => {
                    return (val < 50 ? null : "Invalid slider value, see validateValue()");
                },
            },
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
                            { label: 'Number from', placeholder: 'from' },
                            { label: 'Number to', placeholder: 'to' },
                        ],
                    }
                },
            },
        },
        date: {
            label: 'Date',
            type: 'date',
            valueSources: ['value'],
            fieldSettings: {
                dateFormat: 'DD-MM-YYYY',
                validateValue: (val, fieldSettings) => {
                    // example of date validation
                    const dateVal = moment(val, fieldSettings.valueFormat);
                    return dateVal.year() != (new Date().getFullYear()) ? "Please use current year" : null;
                },
            },
        },
        time: {
            label: 'Time',
            type: 'time',
            valueSources: ['value'],
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
            fieldSettings: {
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
        },
        color2: {
            label: 'Color2',
            type: 'select',
            fieldSettings: {
                listValues: {
                    yellow: 'Yellow',
                    green: 'Green',
                    orange: 'Orange',
                    purple: 'Purple'
                },
            }
        },
        multicolor: {
            label: 'Colors',
            type: 'multiselect',
            fieldSettings: {
                listValues: {
                    yellow: 'Yellow',
                    green: 'Green',
                    orange: 'Orange'
                },
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
            mainWidgetProps: {
                labelYes: "+",
                labelNo: "-"
            }
        },
    };

    //////////////////////////////////////////////////////////////////////

    const funcs: Funcs = {
        LOWER: {
            label: 'Lowercase',
            mongoFunc: '$toLower',
            jsonLogic: "toLowerCase",
            jsonLogicIsMethod: true,
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



    const config: Config = {
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

