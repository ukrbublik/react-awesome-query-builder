import React from 'react';
import merge from 'lodash/merge';
import { Widgets, Operators, BasicConfig } from 'react-awesome-query-builder';
import en_US from 'antd/lib/locale-provider/en_US';
import ru_RU from 'antd/lib/locale-provider/ru_RU';

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
            defaultProximity: 2,
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
        }
    },
    // canReorder: true,
    // canRegroup: true,
    // showNot: true,
    // showLabels: true,
    maxNesting: 3,
    canLeaveEmptyGroup: true, //after deletion

    renderFieldAndOpAsDropdown: false
};

//////////////////////////////////////////////////////////////////////

const fields = {
    members: {
        label: 'Members',
        tooltip: 'Group of fields',
        type: '!struct',
        subfields: {
            subname: {
                //label: 'Subname', //'subname' should be used instead
                label2: 'MemberName', //only for menu's toggler
                type: 'text',
                tableName: 't1', // PR #18, PR #20
                //operators: ['equal'],
            },
            prox1: {
                label: 'prox',
                tooltip: 'Proximity search',
                type: 'text',
                operators: ['proximity'],
            },
        }
    },
    name2: {
        label: 'Name 2',
        type: 'text',
        operators: ['equal', 'not_equal'],
        defaultOperator: 'not_equal',
        mainWidgetProps: {
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => (JSON.stringify(val)),
            valueLabel: "Name2",
            valuePlaceholder: "Enter name2",
            validateValue: (val, fieldDef) => {
                return (val != 'test2');
            },
        },
    },
    num: {
        label: 'Number',
        type: 'number',
        fieldSettings: {
            min: -1,
            max: 5
        },
        operators: [
            "equal",
            "not_equal",
            "less",
            "less_or_equal",
            "greater",
            "greater_or_equal",
            "between",
            "not_between",
            "is_empty",
            "is_not_empty",
        ],
    },
    slider: {
        label: 'Slider',
        type: 'number',
        preferWidgets: ['slider', 'rangeslider'],
        operators: [
            "equal",
            "not_equal",
            "less",
            "less_or_equal",
            "greater",
            "greater_or_equal",
            "range_between",
            "range_not_between",
            "is_empty",
            "is_not_empty",
        ],
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
                    valuePlaceholder: "Use input or slider",
                }
            }
        },
    },
    date: {
        label: 'Date',
        type: 'date',
        operators: ['greater', 'less'],
        defaultOperator: 'less',
    },
    time: {
        label: 'Time',
        type: 'time',
        operators: ['greater_or_equal', 'less_or_equal', 'between'],
        defaultOperator: 'between',
        widgets: {
            time: {
                opProps: {
                    between: {
                        valueLabels: [
                            'Time from',
                            'Time to'
                        ],
                    },
                },
                widgetProps: {
                    timeFormat: 'h:mm:ss A',
                    use12Hours: true,
                },
            },
        },
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
        defaultOperator: 'select_equals',
        operators: [
            'select_equals',
            'select_not_equals',
            'select_any_in',
            'select_not_any_in'
        ],
        listValues: {
            yellow: 'Yellow',
            green: 'Green',
            orange: 'Orange'
        },
    },
    color2: {
        label: 'Color2',
        type: 'select',
        defaultOperator: 'select_not_any_in',
        operators: [
            'select_not_equals',
            'select_not_any_in'
        ],
        listValues: {
            yellow: 'Yellow',
            green: 'Green',
            orange: 'Orange',
            purple: 'Purple'
        },
    },
    color3: {
        label: 'Color3',
        type: 'select',
        defaultOperator: 'select_not_equals',
        operators: [
            'select_not_equals',
            'select_not_any_in'
        ],
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
    stock: {
        label: 'In stock',
        type: 'boolean',
    },
    expecting: {
        valueSources: ['value'],
        label: 'Expecting',
        type: 'boolean',
    },
};

export default {
    conjunctions,
    operators,
    widgets,
    types,
    settings,
    fields: fields,
};

