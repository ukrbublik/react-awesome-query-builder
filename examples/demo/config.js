import React from 'react';
import {
    TextWidget,
    NumberWidget,
    SelectWidget,
    MultiSelectWidget,
    DateWidget,
    BooleanWidget,
    TimeWidget,
    DateTimeWidget
} from 'react-query-builder/components/widgets';
import {ProximityOperator} from 'react-query-builder/components/operators';

export default {
    conjunctions: {
        AND: {
            label: 'And',
            value: (value) => value.size > 1 ? `(${value.join(' AND ')})` : value.first()
        },
        OR: {
            label: 'Or',
            value: (value) => value.size > 1 ? `(${value.join(' OR ')})` : value.first()
        },
    },
    fields: {
        members: {
            label: 'Members',
            widget: '!struct',
            subfields: {
                subname: {
                    //label: 'Subname', //'subname' should be used instead
                    label2: 'MemberName',
                    widget: 'text',
                    operators: ['proximity'],
                },
            }
        },
        name: {
            label: 'Name',
            widget: 'text',
            operators: ['equal', 'not_equal'],
            defaultOperator: 'not_equal',
        },
        num: {
            label: 'Number',
            widget: 'number',
            widgetProps: {
                min: 2,
                max: 5
            }
        },
        date: {
            label: 'Date',
            widget: 'date',
        },
        time: {
            label: 'Time',
            widget: 'time',
        },
        datetime: {
            label: 'DateTime',
            widget: 'datetime',
        },
        color: {
            label: 'Color',
            widget: 'select',
            listValues: {
                yellow: 'Yellow',
                green: 'Green',
                orange: 'Orange'
            },
        },
        multicolor: {
            label: 'Colors',
            widget: 'multiselect',
            listValues: {
                yellow: 'Yellow',
                green: 'Green',
                orange: 'Orange'
            },
        },
    },
    operators: {
        equal: {
            label: '==',
            value: (value, field) => `${field}:${value.first()}`
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
            value: (value, field) => `[${field}:${value.first()} TO ${value.get(1)}]`,
            valueLabels: [
                'Value from', 
                'Value to'
            ],
        },
        not_between: {
            label: 'Not between',
            cardinality: 2,
            valueLabels: [
                'Value from', 
                'Value to'
            ],
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
            value: (value, field, operatorOptions, operator, config, fieldDefinition) => `${field}:${fieldDefinition.options[value.first()]}`
        },
        select_in: {
            label: 'In',
            value: (value, field, operatorOptions, operator, config, fieldDefinition) => {
                console.log(2, value);
                return '';
            }
        },

        contains: {
          label: 'Contains',
          value: (value, field) => `${field}:*${value.first()}*`
        },
        starts_with: {
          label: 'Starts with',
          value: (value, field) => `${field}:${value.first()}*`
        },
        ends_with: {
          label: 'Ends with',
          value: (value, field) => `${field}:*${value.first()}`
        },
        exact_phrase: {
          label: 'Exact phrase',
          value: (value, field) => `${field}:"${value.first()}"`
        },
        terms_one: {
          label: 'At least one of the words',
          value: (value, field) => `${field}:(${value.first().trim().split(' ').join(' OR ')})`
        },
        terms_all: {
          label: 'All of the words',
          value: (value, field) => `${field}:(${value.first().trim().split(' ').join(' AND ')})`
        },
        terms_none: {
          label: 'Without the words',
          value: (value, field) => `-${field}:(${value.first().trim().split(' ').join(' OR ')})`
        },

        proximity: {
          label: 'Proximity search',
          cardinality: 2,
          valueLabels: [
            'Word 1', 
            'Word 2'
          ],
          value: (value, field, options) => {
            const output = value.map(currentValue => currentValue.indexOf(' ') !== -1 ? `\\"${currentValue}\\"` : currentValue);
            return `${field}:"(${output.join(') (')})"~${options.get('proximity')}`;
          },
          options: {
            optionLabel: "Words between",
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
            operators: [
                'equal',
                'not_equal',
                "is_empty",
                "is_not_empty",
            ]
        },
        number: {
            factory: (props) => <NumberWidget {...props} />,
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
            defaultOperator: 'less', //todo test
        },
        select: {
            factory: (props) => <SelectWidget {...props} />,
            operators: ['select_equals']
        },
        multiselect: {
            factory: (props) => <MultiSelectWidget {...props} />,
            operators: ['select_in']
        },
        date: {
            factory: (props) => <DateWidget {...props} />,
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD',
            locale: 'ru',
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
        },
        time: {
            factory: (props) => <TimeWidget {...props} />,
            timeFormat: 'HH:mm',
            valueFormat: 'HH:mm:ss',
            locale: 'ru',
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
        },
        datetime: {
            factory: (props) => <DateTimeWidget {...props} />,
            timeFormat: 'HH:mm',
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            locale: 'ru',
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
        },
        boolean: {
            factory: (props) => <BooleanWidget {...props} />
        }
    },
    settings: {
        renderSize: 'small',
        renderConjsAsRadios: false,
        renderFieldAndOpAsDropdown: true,
        setOpOnChangeField: ['default'], // 'default' (default if present), 'keep' (keep prev from last field), 'first', 'none'
        setDefaultFieldAndOp: false,
        maxNesting: 10,
        fieldSeparator: '.',
        fieldSeparatorDisplay: '->',
        showLabels: true,
        valueLabel: "Value",
        fieldLabel: "Field",
        operatorLabel: "Operator",
        selectFieldLabel: "Select field",
        selectOperatorLabel: "Select operator",
        deleteLabel: null,
        addGroupLabel: "Add group",
        addRuleLabel: "Add rule",
        delGroupLabel: null,
    }
};
