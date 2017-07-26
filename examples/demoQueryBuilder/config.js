import React from 'react';
import {
    TextWidget,
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
            operators: ['selectEquals']
        },
        multicolor: {
            label: 'Multicolor',
            widget: 'multiselect',
            options: {
                yellow: 'Yellow',
                green: 'Green',
                orange: 'Orange'
            },
            operators: ['in']
        },
    },
    operators: {
        equal: {label: 'Equal'},
        not_equal: {label: 'Not equal'},
        less: {label: 'Less'},
        less_or_equal: {label: 'Less or equal'},
        greater: {label: 'Greater'},
        greater_or_equal: {label: 'Greater or equal'},

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
        selectEquals: {
            label: 'Equals',
            value: (value, field, operatorOptions, valueOptions, operator, config, fieldDefinition) => `${field}:${fieldDefinition.options[value.first()]}`
        },
        in: {
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
        select: {
            factory: (props) => <SelectWidget {...props} />
        },
        multiselect: {
            factory: (props) => <MultiSelectWidget {...props} />
        },
        date: {
            factory: (props) => <DateWidget {...props} />
        },
        time: {
            factory: (props) => <TimeWidget {...props} />
        },
        datetime: {
            factory: (props) => <DateTimeWidget {...props} />
        },
        boolean: {
            factory: (props) => <BooleanWidget {...props} />
        }
    },
    settings: {
        maxNesting: 10,
        fieldSeparator: '.',
        fieldSeparatorDisplay: '->'
    }
};
