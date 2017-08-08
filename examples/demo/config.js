import React from 'react';
import {Widgets, Operators} from 'react-awesome-query-builder';
const {
    TextWidget,
    NumberWidget,
    SelectWidget,
    MultiSelectWidget,
    DateWidget,
    BooleanWidget,
    TimeWidget,
    DateTimeWidget
} = Widgets;
const {ProximityOperator} = Operators;

export default {
    conjunctions: {
        AND: {
            label: 'And',
            formatValue: (value) => value.size > 1 ? `(${value.join(' AND ')})` : value.first()
        },
        OR: {
            label: 'Or',
            formatValue: (value) => value.size > 1 ? `(${value.join(' OR ')})` : value.first()
        },
    },
    fields: {
        members: {
            label: 'Members',
            type: '!struct',
            subfields: {
                subname: {
                    //label: 'Subname', //'subname' should be used instead
                    label2: 'MemberName',
                    type: 'text',
                    operators: ['proximity'],
                },
            }
        },
        name: {
            label: 'Name',
            type: 'text',
            operators: ['equal'],
            defaultOperator: 'not_equal',
        },
        name2: {
            label: 'Name 2',
            type: 'text',
            operators: ['equal', 'not_equal'],
            defaultOperator: 'not_equal',
            // widgetProps: {..}  - same as widgets: { text: { widgetProps: {..} } }
            widgetProps: {
                valueLabel: "Name2",
                valuePlaceholder: "Enter name2",
            }
        },
        num: {
            label: 'Number',
            type: 'number',
            fieldSettings: {
                min: 2,
                max: 5
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
                orange: 'Orange'
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
                        valueLabel: "Text",
                        valuePlaceholder: "Enter text",
                    }
                }
            },
        },
        number: {
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
                    ],
                    defaultOperator: 'less',
                    widgetProps: {
                        valueLabel: "Number2",
                        valuePlaceholder: "Enter number2",
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
                                'Date from', 
                                'Date to'
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
            widgets: {
                select: {
                    operators: [
                        'select_equals',
                        'select_not_equals'
                    ],
                    widgetProps: {
                    },
                },
                multiselect: {
                    operators: [
                        'select_any_in',
                        'select_not_any_in'
                    ],
                    widgetProps: {
                    },
                }
            },
        },
        multiselect: {
            widgets: {
                multiselect: {
                    operators: [
                        'multiselect_full_match',
                        'select_any_in',
                        'select_not_any_in'
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
                        hideOperator: true,
                        operatorInlineLabel: "is",
                    }
                }
            },
        },
    },
    operators: {
        equal: {
            label: '==',
            formatValue: (value, field) => `${field}:${value.first()}`
        },
        not_equal: {
            label: '!='
        },
        less: {
            label: '<'
        },
        less_or_equal: {
            label: '<='
        },
        greater: {
            label: '>'
        },
        greater_or_equal: {
            label: '>='
        },

        between: {
            label: 'Between',
            cardinality: 2,
            formatValue: (value, field) => `[${field}:${value.first()} TO ${value.get(1)}]`,
            valueLabels: [
                'Value from', 
                'Value to'
            ],
            textSeparators: [
                null,
                'and'
            ]
        },
        not_between: {
            label: 'Not between',
            cardinality: 2,
            valueLabels: [
                'Value from', 
                'Value to'
            ],
            textSeparators: [
                null,
                'and'
            ]
        },

        is_empty: {
            label: 'Is Empty',
            cardinality: 0,
        },
        is_not_empty: {
            label: 'Is not empty',
            cardinality: 0,
        },
        select_equals: {
            label: '==',
            formatValue: (value, field, operatorOptions, operator, config, fieldDefinition) => 
                `${field}:${fieldDefinition.options[value.first()]}`
        },
        select_not_equals: {
            label: '!=',
            formatValue: (value, field, operatorOptions, operator, config, fieldDefinition) => 
                `${field}:${fieldDefinition.options[value.first()]}`
        },
        select_any_in: {
            label: 'Any in',
            formatValue: (value, field, operatorOptions, operator, config, fieldDefinition) => {
                //todo
                return '';
            }
        },
        select_not_any_in: {
            label: 'Not in',
            formatValue: (value, field, operatorOptions, operator, config, fieldDefinition) => {
                //todo
                return '';
            }
        },
        multiselect_full_match: {
            label: 'Matches',
            formatValue: (value, field, operatorOptions, operator, config, fieldDefinition) => {
                //todo
                return '';
            }
        },

        contains: {
          label: 'Contains',
          formatValue: (value, field) => `${field}:*${value.first()}*`
        },
        starts_with: {
          label: 'Starts with',
          formatValue: (value, field) => `${field}:${value.first()}*`
        },
        ends_with: {
          label: 'Ends with',
          formatValue: (value, field) => `${field}:*${value.first()}`
        },
        exact_phrase: {
          label: 'Exact phrase',
          formatValue: (value, field) => `${field}:"${value.first()}"`
        },
        terms_one: {
          label: 'At least one of the words',
          formatValue: (value, field) => `${field}:(${value.first().trim().split(' ').join(' OR ')})`
        },
        terms_all: {
          label: 'All of the words',
          formatValue: (value, field) => `${field}:(${value.first().trim().split(' ').join(' AND ')})`
        },
        terms_none: {
          label: 'Without the words',
          formatValue: (value, field) => `-${field}:(${value.first().trim().split(' ').join(' OR ')})`
        },

        proximity: {
          label: 'Proximity search',
          cardinality: 2,
          valueLabels: [
            {label: 'Word 1', placeholder: 'Enter first word'},
            'Word 2'
          ],
          formatValue: (value, field, options) => {
            const output = value.map(currentValue => currentValue.indexOf(' ') !== -1 ? `\\"${currentValue}\\"` : currentValue);
            return `${field}:"(${output.join(') (')})"~${options.get('proximity')}`;
          },
          options: {
            optionLabel: "Words between",
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
            factory: (props) => <TextWidget {...props} />,
        },
        number: {
            factory: (props) => <NumberWidget {...props} />,
            valueLabel: "Number",
            valuePlaceholder: "Enter number",
        },
        select: {
            factory: (props) => <SelectWidget {...props} />,
        },
        multiselect: {
            factory: (props) => <MultiSelectWidget {...props} />,
        },
        date: {
            factory: (props) => <DateWidget {...props} />,
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD',
        },
        time: {
            factory: (props) => <TimeWidget {...props} />,
            timeFormat: 'HH:mm',
            valueFormat: 'HH:mm:ss',
        },
        datetime: {
            factory: (props) => <DateTimeWidget {...props} />,
            timeFormat: 'HH:mm',
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
        },
        boolean: {
            factory: (props) => <BooleanWidget {...props} />,
            labelYes: "Yes",
            labelNo: "No ",
        }
    },
    settings: {
        locale: {
            short: 'en',
            full1: 'en-US',
            full2: 'en_US',
        },
        hideConjForOne: true,
        renderSize: 'small',
        renderConjsAsRadios: false,
        renderFieldAndOpAsDropdown: true,
        setOpOnChangeField: ['default'], // 'default' (default if present), 'keep' (keep prev from last field), 'first', 'none'
        clearValueOnChangeField: true, //false - if prev & next fields have same type (widget), keep
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
        delGroupLabel: null,
        canLeaveEmptyGroup: true, //after deletion
    }
};
