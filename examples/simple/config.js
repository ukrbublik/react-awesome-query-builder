import { TextWidget, SelectWidget } from 'react-query-builder';

export default {
  conjunctions: {
    and: {
      label: 'And',
      value: value => value.length > 1 ? '(' + value.join(' AND ') + ')' : value[0]
    },
    or: {
      label: 'Or',
      value: value => value.length > 1 ? '(' + value.join(' OR ') + ')' : value[0]
    }
  },
  fields: {
    name: {
      id: 'name',
      label: 'Name',
      widget: 'text',
      operators: ['contains', 'startsWith', 'endsWith']
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
      value: (value, field) => field.id + ':' + value[0]
    },
    contains: {
      label: 'Contains',
      value: (value, field) => field.id + ':*' + value[0] + '*'
    },
    startsWith: {
      label: 'Starts with',
      value: (value, field) => field.id + ':' + value[0] + '*'
    },
    endsWith: {
      label: 'Ends with',
      value: (value, field) => field.id + ':*' + value[0]
    }
  },
  widgets: {
    text: {
      name: 'text',
      component: TextWidget,
      value: value => value
    },
    select: {
      name: 'select',
      component: SelectWidget,
      value: value => value
    }
  },
  settings: {
    defaultConjunction: 'and',
    defaultField: 'name',
    maxNesting: 3
  }
}