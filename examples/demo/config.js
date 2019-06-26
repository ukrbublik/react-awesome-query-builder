import React from 'react'
import moment from 'moment'
import enUS from 'antd/lib/locale-provider/en_US'
// import ru_RU from 'antd/lib/locale-provider/ru_RU'
import { Widgets, Operators } from '../../modules'
import { addRule } from '../../modules/actions/tree'

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

const fm = v => (v || '').split('.').pop()

export default {
  // 逻辑关系（Group中条件的与非）
  conjunctions: {
    AND: {
      label: fm('common.logic.and'),
      mongoConj: '$and',
      reversedConj: 'OR',
      formatConj: (children, conj, not, isForDisplay) => {
        return children.size > 1
          ? (not ? 'NOT ' : '') + '(' + children.join(' ' + (isForDisplay ? 'AND' : '&&') + ' ') + ')'
          : (not ? 'NOT (' : '') + children.first() + (not ? ')' : '')
      }
    },
    OR: {
      label: fm('common.logic.or'),
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
    tag: {
      label: 'tag',
      type: 'tag',
      defaultOperator: 'eq',
      valueSources: ['value']
    },
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
    tag: {
      widgets: {
        tag: {
          defaultOperator: 'eq',
          operators: [
            'eq'
          ],
          widgetProps: {
            customProps: {}
          }
        }
      }
    },
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
            formatValue: (val, fieldDef, wgtDef, isForDisplay) => (JSON.stringify(val))
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
          defaultOperator: 'intersection',
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
      label: fm('form.builder.operator.eq'),
      labelForFormat: '==',
      reversedOp: 'neq',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$eq': value } })
    },
    neq: {
      label: fm('form.builder.operator.neq'),
      labelForFormat: '!=',
      reversedOp: 'eq',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$ne': value } })
    },
    lt: {
      label: fm('form.builder.operator.lt'),
      labelForFormat: '<',
      reversedOp: 'ge',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$lt': value } })
    },
    le: {
      label: fm('form.builder.operator.le'),
      labelForFormat: '<=',
      reversedOp: 'gt',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$lte': value } })
    },
    gt: {
      label: fm('form.builder.operator.gt'),
      labelForFormat: '>',
      reversedOp: 'le',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$gt': value } })
    },
    ge: {
      label: fm('form.builder.operator.ge'),
      labelForFormat: '>=',
      reversedOp: 'lt',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$gte': value } })
    },
    between: {
      label: fm('form.builder.operator.between'),
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
        fm('form.builder.operator.betweenFrom'),
        fm('form.builder.operator.betweenTo')
      ],
      textSeparators: [
        null,
        fm('form.builder.operator.betweenAnd')
      ],
      reversedOp: 'not_between'
    },
    not_between: {
      label: fm('form.builder.operator.notBetween'),
      labelForFormat: 'NOT BETWEEN',
      cardinality: 2,
      mongoFormatOp: (field, op, values) => ({ [field]: { '$not': { '$gte': values[0], '$lte': values[1] } } }),
      valueLabels: [
        fm('form.builder.operator.betweenFrom'),
        fm('form.builder.operator.betweenTo')
      ],
      textSeparators: [
        null,
        fm('form.builder.operator.betweenAnd')
      ],
      reversedOp: 'between'
    },
    contains: {
      label: fm('form.builder.operator.contains'),
      labelForFormat: 'contains',
      reversedOp: 'ncontains',
      mongoFormatOp: () => {}
    },
    ncontains: {
      label: fm('form.builder.operator.ncontains'),
      labelForFormat: 'ncontains',
      reversedOp: 'contains',
      mongoFormatOp: () => {}
    },
    startwith: {
      label: fm('form.builder.operator.startwith'),
      labelForFormat: 'startwith',
      reversedOp: 'nstartwith',
      mongoFormatOp: () => {}
    },
    nstartwith: {
      label: fm('form.builder.operator.nstartwith'),
      labelForFormat: 'nstartwith',
      reversedOp: 'startwith',
      mongoFormatOp: () => {}
    },
    exists: {
      isUnary: true,
      label: fm('form.builder.operator.exists'),
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
      label: fm('form.builder.operator.nexists'),
      labelForFormat: 'IS NOT EXISTS',
      cardinality: 0,
      reversedOp: 'exists',
      formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        return isForDisplay ? `${field} IS EXISTS` : `!${field}`
      },
      mongoFormatOp: (field, op) => ({ [field]: { '$exists': false } })
    },
    in: {
      label: fm('form.builder.operator.in'),
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
      label: fm('form.builder.operator.intersection'),
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
      label: fm('form.builder.operator.nintersection'),
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
      label: fm('form.builder.operator.issubset'),
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
    tag: {
      type: 'tag',
      valueSrc: 'value',
      factory: (props) => <TextWidget {...props} />,
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
        return isForDisplay ? '\'' + val + '\'' : JSON.stringify(val)
      },
      actions: { addRule }
    },
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
    setDefaultFieldAndOp: true,
    defaultField: 'tag',
    defaultOperator: () => 'eq',
    maxNesting: 10,
    fieldSeparator: '.',
    fieldSeparatorDisplay: '->',
    showLabels: false,
    valueLabel: fm('form.builder.value'),
    valuePlaceholder: fm('form.builder.valuePlaceholder'),
    fieldLabel: fm('form.builder.field'),
    operatorLabel: fm('form.builder.operator'),
    fieldPlaceholder: fm('form.builder.fieldPlaceholder'),
    operatorPlaceholder: fm('form.builder.operatorPlaceholder'),
    deleteLabel: null,
    addGroupLabel: fm('form.builder.addGroup'),
    addRuleLabel: fm('form.builder.addRule'),
    readonlyMode: false,
    notLabel: fm('common.logic.not'),
    showNot: true,
    showAddGroup: true,
    delGroupLabel: fm('form.builder.removeGroup'),
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
