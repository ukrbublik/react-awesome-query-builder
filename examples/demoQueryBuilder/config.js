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
import {ComplexQueryOptions} from 'react-query-builder/components/options';

export default {
    conjunctions: {
        AND: {
            label: 'And',
        },
        OR: {
            label: 'Or',
        },
    },
    fields: {
        members: {
            label: 'Members',
            widget: 'submenu'
        },
        "members.name1": {
            label: 'Members.Name1',
            label2: 'MemberName1',
            widget: 'text',
            operators: ['equal']
        },
        name: {
            label: 'Name',
            widget: 'text',
            operators: [
                'equal',
                'not_equal',
                "is_empty",
                "is_not_empty",
            ]
        },
        num: {
            label: 'Number',
            widget: 'number',
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
            widgetProps: {
                min: 2,
                max: 5
            }
        },
        date: {
            label: 'Date',
            widget: 'date',
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
            label: 'Time',
            widget: 'time',
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
            label: 'DateTime',
            widget: 'datetime',
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
        color: {
            label: 'Color',
            widget: 'select',
            options: {
                yellow: 'Yellow',
                green: 'Green',
                orange: 'Orange'
            },
            operators: ['select_equals']
        },
        multicolor: {
            label: 'Colors',
            widget: 'multiselect',
            options: {
                yellow: 'Yellow',
                green: 'Green',
                orange: 'Orange'
            },
            operators: ['select_in']
        },
    },
    operators: {
        equal: {label: '=='},
        not_equal: {label: '!='},
        less: {label: '<'},
        less_or_equal: {label: '<='},
        greater: {label: '>'},
        greater_or_equal: {label: '>='},

        between: {
            label: 'Between',
            cardinality: 2,
        },
        not_between: {
            label: 'Not between',
            cardinality: 2,
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
            value: (value, field, operatorOptions, valueOptions, operator, config, fieldDefinition) => `${field}:${fieldDefinition.options[value.first()]}`
        },
        select_in: {
            label: 'In',
            value: (value, field, operatorOptions, valueOptions, operator, config, fieldDefinition) => {
                console.log(2, value);
                return '';
            }
        },
    },
    widgets: {
        text: {
            factory: (props) => <TextWidget {...props} />
        },
        number: {
            factory: (props) => <NumberWidget {...props} />
        },
        select: {
            factory: (props) => <SelectWidget {...props} />
        },
        multiselect: {
            factory: (props) => <MultiSelectWidget {...props} />
        },
        date: {
            factory: (props) => <DateWidget {...props} />,
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD',
            locale: 'ru',
        },
        time: {
            factory: (props) => <TimeWidget {...props} />,
            timeFormat: 'HH:mm',
            valueFormat: 'HH:mm:ss',
            locale: 'ru',
        },
        datetime: {
            factory: (props) => <DateTimeWidget {...props} />,
            timeFormat: 'HH:mm',
            dateFormat: 'DD.MM.YYYY',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            locale: 'ru',
        },
        boolean: {
            factory: (props) => <BooleanWidget {...props} />
        }
    },
    settings: {
        maxNesting: 10,
        fieldSeparator: '.',
        fieldSeparatorDisplay: '->',
        showLabels: false,
        valueLabel: "Value",
        fieldLabel: "Field",
        operatorLabel: "Operator",
        deleteLabel: "x",
        addGroupLabel: "Add group",
        addRuleLabel: "Add rule",
        delGroupLabel: "x",
    }
};
