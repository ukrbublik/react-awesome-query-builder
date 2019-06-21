import React from 'react'
import moment from 'moment'
import enUS from 'antd/lib/locale-provider/en_US'
// import ru_RU from 'antd/lib/locale-provider/ru_RU'
import { Widgets, Operators } from '../../modules'

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
} = Widgets

const { ProximityOperator } = Operators

export default {
  // 逻辑关系（Group中条件的与非）
  conjunctions: {
    AND: {
      label: 'And',
      mongoConj: '$and',
      reversedConj: 'OR',
      formatConj: (children, conj, not, isForDisplay) => {
        return children.size > 1
          ? (not ? 'NOT ' : '') + '(' + children.join(' ' + (isForDisplay ? 'AND' : '&&') + ' ') + ')'
          : (not ? 'NOT (' : '') + children.first() + (not ? ')' : '')
      }
    },
    OR: {
      label: 'Or',
      mongoConj: '$or',
      reversedConj: 'AND',
      formatConj: (children, conj, not, isForDisplay) => {
        return children.size > 1
          ? (not ? 'NOT ' : '') + '(' + children.join(' ' + (isForDisplay ? 'OR' : '||') + ' ') + ')'
          : (not ? 'NOT (' : '') + children.first() + (not ? ')' : '')
      }
    }
  },
  // 字段（表达式左边）
  fields: {
    dataset_0: {
      label: 'Dataset_0',
      type: '!struct',
      subfields: {
        text: {
          label: 'text',
          type: 'text',
          tableName: null
        },
        array: {
          label: 'array',
          type: 'array',
          tableName: null
        }
      }
    }
  },
  // 字段类型（字段类型影响操作符和格式化结果）
  types: {
    text: {
      widgets: {
        text: {
          defaultOperator: 'eq',
          operators: [
            'eq',
            'neq',
            'gt',
            'lt',
            'contains',
            'ncontains',
            'startwith',
            'nstartwith',
            'between',
            'exists',
            'nexists'
          ],
          widgetProps: {
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => (JSON.stringify(val)),
            valueLabel: 'Text',
            valuePlaceholder: 'Enter text'
          }
        },
        multiselect: {
          operators: [
            'in'
          ],
          widgetProps: {
            customProps: {
              mode: 'tags',
              tokenSeparators: [','],
              allowClear: true
            }
          }
        }
      }
    },
    array: {
      widgets: {
        multiselect: {
          operators: [
            'intersection',
            'nintersection',
            'issubset'
          ],
          widgetProps: {
            customProps: {
              mode: 'tags',
              tokenSeparators: [','],
              allowClear: true
            }
          }
        }
      }
    }
  },
  // 操作符（表达式中间）
  operators: {
    eq: {
      label: '==',
      labelForFormat: '==',
      reversedOp: 'neq',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$eq': value } })
    },
    neq: {
      label: '!=',
      labelForFormat: '!=',
      reversedOp: 'eq',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$ne': value } })
    },
    lt: {
      label: '<',
      labelForFormat: '<',
      reversedOp: 'ge',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$lt': value } })
    },
    le: {
      label: '<=',
      labelForFormat: '<=',
      reversedOp: 'gt',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$lte': value } })
    },
    gt: {
      label: '>',
      labelForFormat: '>',
      reversedOp: 'le',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$gt': value } })
    },
    ge: {
      label: '>=',
      labelForFormat: '>=',
      reversedOp: 'lt',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$gte': value } })
    },
    between: {
      label: 'Between',
      labelForFormat: 'BETWEEN',
      cardinality: 2,
      formatOp: (field, op, values, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay) => {
        let valFrom = values.first()
        let valTo = values.get(1)
        if (isForDisplay) {
          return `${field} >= ${valFrom} AND ${field} <= ${valTo}`
        } else {
          return `${field} >= ${valFrom} && ${field} <= ${valTo}`
        }
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
      reversedOp: 'not_between'
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
      reversedOp: 'between'
    },
    contains: {
      label: 'Contains',
      labelForFormat: 'contains',
      reversedOp: 'ncontains',
      mongoFormatOp: () => {}
    },
    ncontains: {
      label: 'Not Contains',
      labelForFormat: 'ncontains',
      reversedOp: 'contains',
      mongoFormatOp: () => {}
    },
    startwith: {
      label: 'StartsWith',
      labelForFormat: 'startwith',
      reversedOp: 'nstartwith',
      mongoFormatOp: () => {}
    },
    nstartwith: {
      label: 'Not StartsWith',
      labelForFormat: 'nstartwith',
      reversedOp: 'startwith',
      mongoFormatOp: () => {}
    },
    exists: {
      isUnary: true,
      label: 'Is Exists',
      labelForFormat: 'IS EXISTS',
      cardinality: 0,
      reversedOp: 'nexists',
      formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        return isForDisplay ? `${field} IS NOT EXISTS` : `!!${field}`
      },
      mongoFormatOp: (field, op) => ({ [field]: { '$exists': true } })
    },
    nexists: {
      isUnary: true,
      label: 'Is Not Exists',
      labelForFormat: 'IS NOT EXISTS',
      cardinality: 0,
      reversedOp: 'exists',
      formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        return isForDisplay ? `${field} IS EXISTS` : `!${field}`
      },
      mongoFormatOp: (field, op) => ({ [field]: { '$exists': false } })
    },
    in: {
      label: 'In',
      labelForFormat: 'IN',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        if (valueSrc === 'value') {
          return `${field} IN (${values.join(', ')})`
        } else {
          return `${field} IN (${values})`
        }
      },
      mongoFormatOp: (field, op, values) => ({ [field]: { '$in': values } })
    },
    intersection: {
      label: 'intersection',
      labelForFormat: 'Intersection',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        if (valueSrc === 'value') {
          return `${field} intersection (${values.join(', ')})`
        } else {
          return `${field} intersection (${values})`
        }
      },
      mongoFormatOp: (field, op, values) => ({})
    },
    nintersection: {
      label: 'nintersection',
      labelForFormat: 'Nintersection',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        if (valueSrc === 'value') {
          return `${field} nintersection (${values.join(', ')})`
        } else {
          return `${field} nintersection (${values})`
        }
      },
      mongoFormatOp: (field, op, values) => ({})
    },
    issubset: {
      label: 'issubset',
      labelForFormat: 'Issubset',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        if (valueSrc === 'value') {
          return `${field} issubset (${values.join(', ')})`
        } else {
          return `${field} issubset (${values})`
        }
      },
      mongoFormatOp: (field, op, values) => ({})
    }
  },
  // 组建（表达式右边）
  widgets: {
    text: {
      type: 'text',
      valueSrc: 'value',
      factory: (props) => <TextWidget {...props} />,
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
        return isForDisplay ? '\'' + val + '\'' : JSON.stringify(val)
      },
      validateValue: (val, fieldDef) => {
        return (val !== 'test')
      }
    },
    multiselect: {
      type: 'multiselect',
      valueSrc: 'value',
      factory: (props) => <MultiSelectWidget {...props} />,
      formatValue: (vals, fieldDef, wgtDef, isForDisplay) => {
        vals = vals || []
        let valsLabels = vals.map(v => fieldDef.listValues && fieldDef.listValues[v] ? fieldDef.listValues[v] : v)
        return isForDisplay ? valsLabels.map(v => '\'' + v + '\'') : vals.map(v => JSON.stringify(v))
      }
    }
  },
  // 设置
  settings: {
    locale: {
      moment: 'en',
      antd: enUS
    },
    maxLabelsLength: 50,
    hideConjForOne: true,
    renderSize: 'small',
    renderConjsAsRadios: false,
    renderFieldAndOpAsDropdown: false,
    customFieldSelectProps: {
      showSearch: true
    },
    groupActionsPosition: 'topRight',
    setOpOnChangeField: ['keep', 'default'],
    clearValueOnChangeField: false,
    clearValueOnChangeOp: false,
    setDefaultFieldAndOp: false,
    maxNesting: 10,
    fieldSeparator: '.',
    fieldSeparatorDisplay: '->',
    showLabels: false,
    valueLabel: 'Value',
    valuePlaceholder: 'Value',
    fieldLabel: 'Field',
    operatorLabel: 'Operator',
    fieldPlaceholder: 'Select field',
    operatorPlaceholder: 'Select operator',
    deleteLabel: null,
    addGroupLabel: 'Add group',
    addRuleLabel: 'Add rule',
    readonlyMode: false,
    notLabel: 'Not',
    showNot: true,
    showAddGroup: true,
    delGroupLabel: null,
    canLeaveEmptyGroup: true,
    formatReverse: (q, operator, reversedOp, operatorDefinition, revOperatorDefinition, isForDisplay) => {
      if (isForDisplay) {
        return 'NOT(' + q + ')'
      } else {
        return '!(' + q + ')'
      }
    },
    formatField: (field, parts, label2, fieldDefinition, config, isForDisplay) => {
      if (isForDisplay) {
        return label2
      } else {
        return field
      }
    },
    valueSourcesInfo: {
      value: {
        label: 'Value'
      }
    },
    valueSourcesPopupTitle: 'Select value source',
    canReorder: true,
    canCompareFieldWithField: (leftField, leftFieldConfig, rightField, rightFieldConfig) => {
      return true
    }
  }
}
