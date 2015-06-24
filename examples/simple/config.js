import { TextWidget, SelectWidget, DateWidget, ProximityOperator } from 'react-query-builder';

export default {
  conjunctions: {
    and: {
      label: 'And',
      value: value => value.size > 1 ? `(${value.join(' AND ')})` : value.first()
    },
    or: {
      label: 'Or',
      value: value => value.size > 1 ? `(${value.join(' OR ')})` : value.first()
    }
  },
  fields: {
    name: {
      id: 'name',
      label: 'Name',
      widget: 'text',
      operators: ['contains', 'startsWith', 'endsWith', 'proximity']
    },
    date: {
      id: 'date',
      label: 'Date',
      widget: 'date',
      operators: ['equals', 'range', 'minimum', 'maximum']
    },
    color: {
      id: 'color',
      label: 'Color',
      widget: 'select',
      options: {
        yellow: 'Yellow',
        green: 'Green',
        orange: 'Orange'
      },
      operators: ['equals']
    }
  },
  operators: {
    equals: {
      label: 'Equals',
      value: (value, field) => `${field.id}:${value.first()}`
    },
    contains: {
      label: 'Contains',
      value: (value, field) => `${field.id}:*${value.first()}*`
    },
    startsWith: {
      label: 'Starts with',
      value: (value, field) => `${field.id}:${value.first()}*`
    },
    endsWith: {
      label: 'Ends with',
      value: (value, field) => `${field.id}:*${value.first()}`
    },
    proximity: {
      label: 'Proximity',
      cardinality: 2,
      value: (value, field, options) => {
        value = value.map(item => item.indexOf(' ') !== -1 ? `\\"${item}\\"` : item);
        return `${field.id}:"(${value.join(') (')})"~${options.get('proximity')}`
      },
      options: {
        factory: props => <ProximityOperator {...props} />,
        defaults: {
          proximity: 2
        }
      }
    },
    range: {
      label: 'Range',
      cardinality: 2,
      value: (value, field) => `[${field.id}:${value.get(0)} TO ${value.get(1)}]`
    },
    minimum: {
      label: 'Minimum',
      value: (value, field) => `[${field.id}:${value.get(0)} TO *]`
    },
    maximum: {
      label: 'Maximum',
      value: (value, field) => `[${field.id}:* TO ${value.get(0)}]`
    }
  },
  widgets: {
    text: {
      name: 'text',
      factory: props => <TextWidget {...props} />,
      value: value => value.trim()
    },
    select: {
      name: 'select',
      factory: props => <SelectWidget {...props} />,
      value: value => value
    },
    date: {
      name: 'date',
      factory: props => <DateWidget {...props} />,
      value: value => value
    }
  },
  settings: {
    defaultConjunction: 'and',
    defaultField: 'name',
    maxNesting: 10
  }
}
