import React from 'react';
import { Widgets, Operators } from 'react-awesome-query-builder';

const {
    TextWidget,
    NumberWidget,
    SliderWidget,
    RangeWidget,
    SelectWidget,
    MultiSelectWidget,
    DateWidget,
    BooleanWidget,
    TimeWidget,
    DateTimeWidget,
    ValueFieldWidget
} = Widgets;

const { ProximityOperator } = Operators;
import moment from 'moment';
import en_US from 'antd/lib/locale-provider/en_US';
import ru_RU from 'antd/lib/locale-provider/ru_RU';

export default {
    conjunctions: {
        AND: {
            label: 'And',
            mongoConj: '$and',
            reversedConj: 'OR',
            formatConj: (children, conj, not, isForDisplay) => {
                return children.size > 1 ?
                    (not ? "NOT " : "") + '(' + children.join(' ' + (isForDisplay ? "AND" : "&&") + ' ') + ')'
                    : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
            },
        },
        OR: {
            label: 'Or',
            mongoConj: '$or',
            reversedConj: 'AND',
            formatConj: (children, conj, not, isForDisplay) => {
                return children.size > 1 ?
                    (not ? "NOT " : "") + '(' + children.join(' ' + (isForDisplay ? "OR" : "||") + ' ') + ')'
                    : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
            },
        },
    },
    fields: {
        members: {
            label: 'Members',
            type: '!struct',
            subfields: {
                subname: {
                    //label: 'Subname', //'subname' should be used instead
                    label2: 'MemberName', //only for menu's toggler
                    type: 'text',
                    tableName: 't1',
                    operators: ['equal'],
                },
                prox1: {
                    label: 'prox1',
                    type: 'text',
                    operators: ['proximity'],
                },
            }
        },
        prox2: {
            label: 'prox2',
            type: 'text',
            operators: ['proximity'],
            defaultOperator: 'not_equal', //will not be used
        },
        name2: {
            label: 'Name 2',
            type: 'text',
            operators: ['equal', 'not_equal'],
            defaultOperator: 'not_equal',
            mainWidgetProps: {
                formatValue: (val, fieldDef, wgtDef, isForDisplay) => ("__" + JSON.stringify(val)),
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
            valueSources: ['field']
        },
        datetime2: {
            label: 'DateTime2',
            type: 'datetime',
            valueSources: ['value']
        },
        color: {
            label: 'Color',
            type: 'select',
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
        },
        stock: {
            label: 'In stock',
            type: 'boolean',
        },
        expecting: {
            label: 'Expecting',
            type: 'boolean',
        },
    },
    types: {
        text: {
            widgets: {
                text: {
                    defaultOperator: 'is_empty',
                    operators: [
                        'equal',
                        'not_equal',
                        "is_empty",
                        "is_not_empty",
                        'proximity'
                    ],
                    widgetProps: {
                        formatValue: (val, fieldDef, wgtDef, isForDisplay) => ("_" + JSON.stringify(val)),
                        valueLabel: "Text",
                        valuePlaceholder: "Enter text",
                    }
                },
                field: {
                    operators: [
                        'equal',
                        'not_equal',
                        //note that unary ops will be excluded anyway, see getWidgetsForFieldOp()
                        //"is_empty",
                        //"is_not_empty",
                        'proximity'
                    ],
                }
            },
        },
        number: {
            mainWidget: "number",
            valueSources: ['value', 'field'],
            defaultOperator: 'equal',
            widgets: {
                number: {
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
                    widgetProps: {
                        valueLabel: "Number2",
                        valuePlaceholder: "Enter number2",
                    }
                },
                slider: {
                    operators: [
                        "equal",
                        "not_equal",
                        "less",
                        "less_or_equal",
                        "greater",
                        "greater_or_equal",
                    ],
                    widgetProps: {
                        valueLabel: "Slider",
                        valuePlaceholder: "Move slider",
                        customProps: {
                            width: '200px'
                        }
                    }
                },
                rangeslider: {
                    operators: [
                        "range_between",
                        "range_not_between",
                    ],
                    widgetProps: {
                        valueLabel: "Range",
                        valuePlaceholder: "Select range",
                        customProps: {
                            width: '300px'
                        }
                    }
                }
            },
        },
        date: {
            widgets: {
                date: {
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
                    ]
                }
            },
        },
        time: {
            widgets: {
                time: {
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
                    ]
                }
            },
        },
        datetime: {
            widgets: {
                datetime: {
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
                    opProps: {
                        between: {
                            valueLabels: [
                                { label: 'Date from', placeholder: 'Enrer datetime from' },
                                { label: 'Date to', placeholder: 'Enter datetime to' },
                            ],
                        },
                    },
                    widgetProps: {
                        timeFormat: 'HH:mm',
                        dateFormat: 'YYYY-MM-DD',
                        valueFormat: 'YYYY-MM-DD HH:mm',
                    }
                }
            },
        },
        select: {
            mainWidget: "select",
            widgets: {
                select: {
                    operators: [
                        'select_equals',
                        'select_not_equals'
                    ],
                    widgetProps: {
                        customProps: {
                            showSearch: true
                        }
                    },
                },
                multiselect: {
                    operators: [
                        'select_any_in',
                        'select_not_any_in'
                    ],
                    widgetProps: {
                    },
                },
            },
        },
        multiselect: {
            widgets: {
                multiselect: {
                    operators: [
                        'multiselect_equals',
                        'multiselect_not_equals',
                    ]
                }
            },
        },
        boolean: {
            widgets: {
                boolean: {
                    operators: [
                        "equal",
                    ],
                    widgetProps: {
                        //you can enable this if you don't use fields as value sources
                        //hideOperator: true,
                        //operatorInlineLabel: "is",
                    }
                },
                field: {
                    operators: [
                        "equal",
                        "not_equal",
                    ],
                }
            },
        },
    },
    operators: {
        equal: {
            label: '==',
            labelForFormat: '==',
            reversedOp: 'not_equal',
            mongoFormatOp: (field, op, value) => ({ [field]: { '$eq': value } }),
        },
        not_equal: {
            label: '!=',
            labelForFormat: '!=',
            reversedOp: 'equal',
            mongoFormatOp: (field, op, value) => ({ [field]: { '$ne': value } }),
        },
        less: {
            label: '<',
            labelForFormat: '<',
            reversedOp: 'greater_or_equal',
            mongoFormatOp: (field, op, value) => ({ [field]: { '$lt': value } }),
        },
        less_or_equal: {
            label: '<=',
            labelForFormat: '<=',
            reversedOp: 'greater',
            mongoFormatOp: (field, op, value) => ({ [field]: { '$lte': value } }),
        },
        greater: {
            label: '>',
            labelForFormat: '>',
            reversedOp: 'less_or_equal',
            mongoFormatOp: (field, op, value) => ({ [field]: { '$gt': value } }),
        },
        greater_or_equal: {
            label: '>=',
            labelForFormat: '>=',
            reversedOp: 'less',
            mongoFormatOp: (field, op, value) => ({ [field]: { '$gte': value } }),
        },
        between: {
            label: 'Between',
            labelForFormat: 'BETWEEN',
            cardinality: 2,
            formatOp: (field, op, values, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay) => {
                let valFrom = values.first();
                let valTo = values.get(1);
                if (isForDisplay)
                    return `${field} >= ${valFrom} AND ${field} <= ${valTo}`;
                else
                    return `${field} >= ${valFrom} && ${field} <= ${valTo}`;
            },
            mongoFormatOp: (field, op, values) => ({ [field]: { '$gte': values[0], '$lte': values[1] } }),
            valueLabels: [
                'Value from',
                'Value to'
            ],
            textSeparators: [
                null,
                'and'
            ],
            reversedOp: 'not_between',
        },
        not_between: {
            label: 'Not between',
            labelForFormat: 'NOT BETWEEN',
            cardinality: 2,
            mongoFormatOp: (field, op, values) => ({ [field]: { '$not': { '$gte': values[0], '$lte': values[1] } } }),
            valueLabels: [
                'Value from',
                'Value to'
            ],
            textSeparators: [
                null,
                'and'
            ],
            reversedOp: 'between',
        },
        range_between: {
            label: 'Between',
            labelForFormat: 'BETWEEN',
            cardinality: 2,
            isSpecialRange: true, // to show 1 range widget instead of 2
            formatOp: (field, op, values, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay) => {
                let valFrom = values.first();
                let valTo = values.get(1);
                if (isForDisplay)
                    return `${field} >= ${valFrom} AND ${field} <= ${valTo}`;
                else
                    return `${field} >= ${valFrom} && ${field} <= ${valTo}`;
            },
            mongoFormatOp: (field, op, values) => ({ [field]: { '$gte': values[0], '$lte': values[1] } }),
            valueLabels: [
                'Value from',
                'Value to'
            ],
            textSeparators: [
                null,
                'and'
            ],
            reversedOp: 'range_not_between',
        },
        range_not_between: {
            label: 'Not between',
            labelForFormat: 'NOT BETWEEN',
            cardinality: 2,
            isSpecialRange: true, // to show 1 range widget instead of 2
            mongoFormatOp: (field, op, values) => ({ [field]: { '$not': { '$gte': values[0], '$lte': values[1] } } }),
            valueLabels: [
                'Value from',
                'Value to'
            ],
            textSeparators: [
                null,
                'and'
            ],
            reversedOp: 'range_between',
        },
        is_empty: {
            isUnary: true,
            label: 'Is Empty',
            labelForFormat: 'IS EMPTY',
            cardinality: 0,
            reversedOp: 'is_not_empty',
            formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                return isForDisplay ? `${field} IS EMPTY` : `!${field}`;
            },
            mongoFormatOp: (field, op) => ({ [field]: { '$exists': false } }),
        },
        is_not_empty: {
            isUnary: true,
            label: 'Is not empty',
            labelForFormat: 'IS NOT EMPTY',
            cardinality: 0,
            reversedOp: 'is_empty',
            formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                return isForDisplay ? `${field} IS NOT EMPTY` : `!!${field}`;
            },
            mongoFormatOp: (field, op) => ({ [field]: { '$exists': true } }),
        },
        select_equals: {
            label: '==',
            labelForFormat: '==',
            formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                return `${field} == ${value}`;
            },
            mongoFormatOp: (field, op, value) => ({ [field]: { '$eq': value } }),
            reversedOp: 'select_not_equals',
        },
        select_not_equals: {
            label: '!=',
            labelForFormat: '!=',
            formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                return `${field} != ${value}`;
            },
            mongoFormatOp: (field, op, value) => ({ [field]: { '$ne': value } }),
            reversedOp: 'select_equals',
        },
        select_any_in: {
            label: 'Any in',
            labelForFormat: 'IN',
            formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                if (valueSrc == 'value')
                    return `${field} IN (${values.join(', ')})`;
                else
                    return `${field} IN (${values})`;
            },
            mongoFormatOp: (field, op, values) => ({ [field]: { '$in': values } }),
            reversedOp: 'select_not_any_in',
        },
        select_not_any_in: {
            label: 'Not in',
            labelForFormat: 'NOT IN',
            formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                if (valueSrc == 'value')
                    return `${field} NOT IN (${values.join(', ')})`;
                else
                    return `${field} NOT IN (${values})`;
            },
            mongoFormatOp: (field, op, values) => ({ [field]: { '$nin': values } }),
            reversedOp: 'select_any_in',
        },
        multiselect_equals: {
            label: 'Equals',
            labelForFormat: '==',
            formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                if (valueSrc == 'value')
                    return `${field} == [${values.join(', ')}]`;
                else
                    return `${field} == ${values}`;
            },
            mongoFormatOp: (field, op, values) => ({ [field]: { '$eq': values } }),
            reversedOp: 'multiselect_not_equals',
        },
        multiselect_not_equals: {
            label: 'Not equals',
            labelForFormat: '!=',
            formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                if (valueSrc == 'value')
                    return `${field} != [${values.join(', ')}]`;
                else
                    return `${field} != ${values}`;
            },
            mongoFormatOp: (field, op, values) => ({ [field]: { '$ne': values } }),
            reversedOp: 'multiselect_equals',
        },
        proximity: {
            label: 'Proximity search',
            cardinality: 2,
            valueLabels: [
                { label: 'Word 1', placeholder: 'Enter first word' },
                'Word 2'
            ],
            textSeparators: [
                //'Word 1',
                //'Word 2'
            ],
            formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                let val1 = values.first();
                let val2 = values.get(1);
                return `${field} ${val1} NEAR/${operatorOptions.get('proximity')} ${val2}`;
            },
            mongoFormatOp: (field, op, values) => (undefined),
            options: {
                optionLabel: "Near",
                optionTextBefore: "Near",
                optionPlaceholder: "Select words between",
                factory: (props) => <ProximityOperator {...props} />,
                defaults: {
                    proximity: 2
                }
            }
        },
    },
    widgets: {
        text: {
            type: "text",
            valueSrc: 'value',
            factory: (props) => <TextWidget {...props} />,
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                return isForDisplay ? '"' + val + '"' : JSON.stringify(val);
            },
            validateValue: (val, fieldDef) => {
                return (val != "test");
            },
        },
        number: {
            type: "number",
            valueSrc: 'value',
            factory: (props) => <NumberWidget {...props} />,
            valueLabel: "Number",
            valuePlaceholder: "Enter number",
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                return isForDisplay ? val : JSON.stringify(val);
            },
            //mongoFormatValue: (val, fieldDef, wgtDef) => (Number(val)),
        },
        slider: {
            type: "number",
            valueSrc: 'value',
            factory: (props) => <SliderWidget {...props} />,
            valueLabel: "Slider",
            valuePlaceholder: "Move Slider",
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                return isForDisplay ? val : JSON.stringify(val);
            },
            customProps: {
                width: '300px'
            }
        },
        rangeslider: {
            type: "number",
            valueSrc: 'value',
            factory: (props) => <RangeWidget {...props} />,
            valueLabel: "Range",
            valuePlaceholder: "Select Range",
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                return isForDisplay ? val : JSON.stringify(val);
            },
            customProps: {
                width: '300px'
            },
            singleWidget: 'slider',
            valueLabels: [
                'Value from',
                'Value to'
            ],
            textSeparators: [
                null,
                'and'
            ],
        },
        select: {
            type: "select",
            valueSrc: 'value',
            factory: (props) => <SelectWidget {...props} />,
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                let valLabel = fieldDef.listValues[val];
                return isForDisplay ? '"' + valLabel + '"' : JSON.stringify(val);
            },
        },
        multiselect: {
            type: "multiselect",
            valueSrc: 'value',
            factory: (props) => <MultiSelectWidget {...props} />,
            formatValue: (vals, fieldDef, wgtDef, isForDisplay) => {
                let valsLabels = vals.map(v => fieldDef.listValues[v]);
                return isForDisplay ? valsLabels.map(v => '"' + v + '"') : vals.map(v => JSON.stringify(v));
            },
        },
        date: {
            type: "date",
            valueSrc: 'value',
            factory: (props) => <DateWidget {...props} />,
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD',
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                let dateVal = moment(val, wgtDef.valueFormat);
                return isForDisplay ? '"' + dateVal.format(wgtDef.dateFormat) + '"' : JSON.stringify(val);
            },
        },
        time: {
            type: "time",
            valueSrc: 'value',
            factory: (props) => <TimeWidget {...props} />,
            timeFormat: 'HH:mm',
            valueFormat: 'HH:mm:ss',
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                let dateVal = moment(val, wgtDef.valueFormat);
                return isForDisplay ? '"' + dateVal.format(wgtDef.timeFormat) + '"' : JSON.stringify(val);
            },
        },
        datetime: {
            type: "datetime",
            valueSrc: 'value',
            factory: (props) => <DateTimeWidget {...props} />,
            timeFormat: 'HH:mm',
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                let dateVal = moment(val, wgtDef.valueFormat);
                return isForDisplay ? '"' + dateVal.format(wgtDef.dateFormat + ' ' + wgtDef.timeFormat) + '"' : JSON.stringify(val);
            },
        },
        boolean: {
            type: "boolean",
            valueSrc: 'value',
            factory: (props) => <BooleanWidget {...props} />,
            labelYes: "Yes",
            labelNo: "No ",
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
                return isForDisplay ? (val ? "Yes" : "No") : JSON.stringify(!!val);
            },
            defaultValue: false,
        },
        field: {
            valueSrc: 'field',
            factory: (props) => <ValueFieldWidget {...props} />,
            formatValue: (val, fieldDef, wgtDef, isForDisplay, valFieldDef) => {
                return isForDisplay ? (valFieldDef.label || val) : val;
            },
            valueLabel: "Field to compare",
            valuePlaceholder: "Select field to compare",
            customProps: {
                showSearch: true
            }
        }
    },
    settings: {
        locale: {
            short: 'en',
            full: 'en-US',
            antd: en_US,
        },
        maxLabelsLength: 50,
        hideConjForOne: true,
        renderSize: 'small',
        renderConjsAsRadios: false,
        renderFieldAndOpAsDropdown: false,
        customFieldSelectProps: {
            showSearch: true
        },
        groupActionsPosition: 'topRight', // oneOf [topLeft, topCenter, topRight, bottomLeft, bottomCenter, bottomRight]
        setOpOnChangeField: ['keep', 'default'], // 'default' (default if present), 'keep' (keep prev from last field), 'first', 'none'
        clearValueOnChangeField: false, //false - if prev & next fields have same type (widget), keep
        clearValueOnChangeOp: false,
        setDefaultFieldAndOp: false,
        maxNesting: 10,
        fieldSeparator: '.',
        fieldSeparatorDisplay: '->',
        showLabels: false,
        valueLabel: "Value",
        valuePlaceholder: "Value",
        fieldLabel: "Field",
        operatorLabel: "Operator",
        fieldPlaceholder: "Select field",
        operatorPlaceholder: "Select operator",
        deleteLabel: null,
        addGroupLabel: "Add group",
        addRuleLabel: "Add rule",
        readonlyMode: false,
        notLabel: "Not",
        showNot: true,
        delGroupLabel: null,
        canLeaveEmptyGroup: true, //after deletion
        formatReverse: (q, operator, reversedOp, operatorDefinition, revOperatorDefinition, isForDisplay) => {
            if (isForDisplay)
                return "NOT(" + q + ")";
            else
                return "!(" + q + ")";
        },
        formatField: (field, parts, label2, fieldDefinition, config, isForDisplay) => {
            if (isForDisplay)
                return label2;
            else
                return field;
        },
        valueSourcesInfo: {
            value: {
                label: "Value"
            },
            field: {
                label: "Field",
                widget: "field",
            }
        },
        valueSourcesPopupTitle: "Select value source",
        canReorder: true,
        canCompareFieldWithField: (leftField, leftFieldConfig, rightField, rightFieldConfig) => {
            //for type == 'select'/'multiselect' you can check listValues
            return true;
        },
    }
};

