import React from 'react';
import { TextWidget, SelectWidget, DateWidget } from 'react-query-builder/components/widgets';
import { ProximityOperator } from 'react-query-builder/components/operators';
import { ComplexQueryOptions } from 'react-query-builder/components/options';

export default {
  conjunctions: {
    and: {
      label: 'And',
      value: (value) => value.size > 1 ? `(${value.join(' AND ')})` : value.first()
    },
    or: {
      label: 'Or',
      value: (value) => value.size > 1 ? `(${value.join(' OR ')})` : value.first()
    }
  },
  fields: {
    name: {
      label: 'Name',
      widget: 'text',
      operators: ['contains', 'startsWith', 'endsWith', 'wordsOne', 'termsAll', 'exactPhrase', 'termsNone', 'proximity', 'complexQuery']
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
        yellow: 'Yellow',
        green: 'Green',
        orange: 'Orange'
      },
      operators: ['equals']
    },
    members: {
        label: 'Members',
        widget: 'submenu'
    },
    "members.name": {
        label: 'Name',
        widget: 'text',
        operators: ['contains', 'startsWith', 'endsWith', 'wordsOne', 'termsAll', 'exactPhrase', 'termsNone', 'proximity', 'complexQuery']
    },
    "members.date": {
        label: 'Date',
        widget: 'date',
        operators: ['equals', 'range', 'minimum', 'maximum']
    },
  },
  operators: {
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
    proximity: {
      label: 'Proximity search',
      cardinality: 2,
      value: (value, field, options) => {
        const output = value.map(currentValue => currentValue.indexOf(' ') !== -1 ? `\\"${currentValue}\\"` : currentValue);
        return `${field}:"(${output.join(') (')})"~${options.get('proximity')}`;
      },
      options: {
        factory: (props) => <ProximityOperator {...props} />,
        defaults: {
          proximity: 2
        }
      }
    },
    complexQuery: {
      label: 'Complex query',
      cardinality: 2,
      value: (value, field, operatorOptions, valueOptions, operator, config) => {
        const output = value
          .map((currentValue, delta) => {
            const operatorDefinition = config.operators[operator];
            const selectedOperator = valueOptions.getIn([delta + '', 'operator'], 'contains');
            const valueFn = operatorDefinition.valueOptions.operators[selectedOperator].value;
            return valueFn(currentValue);
          }).map((currentValue) => currentValue.indexOf(' ') !== -1 ? `\\"${currentValue}\\"` : currentValue);

        return `{!complexphrase}${field}:"(${output.join(') (')})"~${operatorOptions.get('proximity')}`;
      },
      options: {
        factory: (props) => <ProximityOperator {...props} />,
        defaults: {
          proximity: 2
        }
      },
      valueOptions: {
        factory: (props) => <ComplexQueryOptions {...props} />,
        operators: {
          contains: {
            label: 'Contains',
            value: (value) => `*${value}*`
          },
          startsWith: {
            label: 'Starts with',
            value: (value) => `${value}*`
          },
          endsWith: {
            label: 'Ends with',
            value: (value) => `*${value}`
          }
        },
        defaults: {
          operator: 'contains',
          proximity: 2
        }
      }
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
    }
  },
  settings: {
    maxNesting: 10
  }
};
