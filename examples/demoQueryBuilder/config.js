import React from 'react';
import {TextWidget, SelectWidget, DateWidget, BooleanWidget} from 'react-query-builder/components/widgets';
import {ProximityOperator} from 'react-query-builder/components/operators';
import {ComplexQueryOptions} from 'react-query-builder/components/options';

export default {
    conjunctions: {
        and: {
            label: 'And',
            value: (value) => value.size > 1 ? `(${value.join(' AND ')})` : value.first()
        },
        or: {
            label: 'Or',
            value: (value) => value.size > 1 ? `(${value.join(' OR ')})` : value.first()
        },
    },
    fields: {
        name: {
            label: 'Name',
            widget: 'text',
            operators: ['contains', 'startsWith', 'endsWith', 'wordsOne', 'termsAll', 'exactPhrase', 'termsNone']
        },
        date: {
            label: 'Date',
            widget: 'date',
            operators: ['equals', 'range', 'minimum', 'maximum']
        },
        color: {
            label: 'Color',
            widget: 'select',
            options: {
                yellow1: 'Yellow',
                green: 'Green',
                orange: 'Orange'
            },
            operators: ['selectEquals', 'is_empty']
        },
        in_stock: {
            label: "In stock",
            widget: 'select',
            options: {
                0: 'No',
                1: 'Yes'
            },
            operators: ['selectEquals',]
        },
        members: {
            label: 'Members',
            widget: 'submenu'
        },
        "members$$name": {
            label: 'Name',
            widget: 'text',
            operators: ['contains', 'startsWith', 'endsWith', 'wordsOne', 'termsAll', 'exactPhrase', 'termsNone']
        },
        "members$$date": {
            label: 'Date',
            widget: 'date',
            operators: ['equals', 'range', 'minimum', 'maximum']
        },
        "members$$test": {
            label: 'Test',
            widget: 'submenu'
        },
        "members$$color": {
            label: 'Members$$Color',
            widget: 'select',
            options: {
                yellow1: 'Yellow',
                green: 'Green',
                orange: 'Orange'
            },
            operators: ['selectEquals']
        },
        "members$$test$$date": {
            label: 'Members$$Test$$Date$$just$$a$$long$$name',
            widget: 'date',
            operators: ['equals', 'range', 'minimum', 'maximum']
        },
        "members$$test$$hello": {
            label: 'Members$$Test$$Date$$just$$a$$long$$hello$$to$$world',
            widget: 'date',
            operators: ['equals', 'range', 'minimum', 'maximum']
        },
        "members$$test2": {
            label: 'Test',
            widget: 'submenu'
        },
        "members$$test2$$date": {
            label: 'Members$$Test$$Date$$just$$a$$long$$name',
            widget: 'date',
            operators: ['equals', 'range', 'minimum', 'maximum']
        },
        "members$$test2$$hello": {
            label: 'Members$$Test$$Date$$just$$a$$long$$hello$$to$$world',
            widget: 'date',
            operators: ['equals', 'range', 'minimum', 'maximum']
        }
    },
    operators: {
        selectEquals: {
            label: 'Equals',
            value: (value, field, operatorOptions, valueOptions, operator, config, fieldDefinition) => `${field}:${fieldDefinition.options[value.first()]}`
        },
        equals: {
            label: 'Equals',
            value: (value, field) => `${field}:${value.first()}`
        },
        contains: {
            label: 'Contains',
            value: (value, field) => `${field}:*${value.first()}*`
        },
        startsWith: {
            label: 'Starts with',
            value: (value, field) => `${field}:${value.first()}*`
        },
        endsWith: {
            label: 'Ends with',
            value: (value, field) => `${field}:*${value.first()}`
        },
        exactPhrase: {
            label: 'Exact phrase',
            value: (value, field) => `${field}:"${value.first()}"`
        },
        termsOne: {
            label: 'At least one of the words',
            value: (value, field) => `${field}:(${value.first().trim().split(' ').join(' OR ')})`
        },
        termsAll: {
            label: 'All of the words',
            value: (value, field) => `${field}:(${value.first().trim().split(' ').join(' AND ')})`
        },
        termsNone: {
            label: 'Without the words',
            value: (value, field) => `-${field}:(${value.first().trim().split(' ').join(' OR ')})`
        },
        range: {
            label: 'Range',
            cardinality: 2,
            value: (value, field) => `[${field}:${value.first()} TO ${value.get(1)}]`
        },
        minimum: {
            label: 'Minimum',
            value: (value, field) => `[${field}:${value.first()} TO *]`
        },
        maximum: {
            label: 'Maximum',
            value: (value, field) => `[${field}:* TO ${value.first()}]`
        },
        is_empty: {
            label: 'Is empty',
        },
        is_not_empty: {
            label: 'Is not empty',
        }
    },
    widgets: {
        text: {
            factory: (props) => <TextWidget {...props} />
        },
        select: {
            factory: (props) => <SelectWidget {...props} />
        },
        date: {
            factory: (props) => <DateWidget {...props} />
        },
        boolean: {
            factory: (props) => <SelectWidget {...props} />
        }
    },
    settings: {
        maxNesting: 10,
        fieldSeparator: '$$',
        fieldSeparatorDisplay: '->'
    }
};
