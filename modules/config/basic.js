import React from 'react';
import * as Widgets from '../components/widgets/index.js';
import * as Operators from '../components/operators';
import moment from 'moment';
import {settings as defaultSettings} from '../config/default';

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
} = Widgets;
const { ProximityOperator } = Operators;


//----------------------------  conjunctions

const conjunctions = {
  AND: {
      label: 'And',
      mongoConj: '$and',
      reversedConj: 'OR',
      formatConj: (children, conj, not, isForDisplay) => {
          return children.size > 1 ?
              (not ? "NOT " : "") + '(' + children.join(' ' + (isForDisplay ? "AND" : "&&") + ' ') + ')'
              : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
      },
  },
  OR: {
      label: 'Or',
      mongoConj: '$or',
      reversedConj: 'AND',
      formatConj: (children, conj, not, isForDisplay) => {
          return children.size > 1 ?
              (not ? "NOT " : "") + '(' + children.join(' ' + (isForDisplay ? "OR" : "||") + ' ') + ')'
              : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
      },
  },
};

//----------------------------  operators

const operators = {
  equal: {
      label: '==',
      labelForFormat: '==',
      reversedOp: 'not_equal',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$eq': value } }),
  },
  not_equal: {
      label: '!=',
      labelForFormat: '!=',
      reversedOp: 'equal',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$ne': value } }),
  },
  less: {
      label: '<',
      labelForFormat: '<',
      reversedOp: 'greater_or_equal',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$lt': value } }),
  },
  less_or_equal: {
      label: '<=',
      labelForFormat: '<=',
      reversedOp: 'greater',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$lte': value } }),
  },
  greater: {
      label: '>',
      labelForFormat: '>',
      reversedOp: 'less_or_equal',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$gt': value } }),
  },
  greater_or_equal: {
      label: '>=',
      labelForFormat: '>=',
      reversedOp: 'less',
      mongoFormatOp: (field, op, value) => ({ [field]: { '$gte': value } }),
  },
  between: {
      label: 'Between',
      labelForFormat: 'BETWEEN',
      cardinality: 2,
      formatOp: (field, op, values, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay) => {
          let valFrom = values.first();
          let valTo = values.get(1);
          if (isForDisplay)
              return `${field} >= ${valFrom} AND ${field} <= ${valTo}`;
          else
              return `${field} >= ${valFrom} && ${field} <= ${valTo}`;
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
      reversedOp: 'not_between',
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
      reversedOp: 'between',
  },
  range_between: {
      label: 'Between',
      labelForFormat: 'BETWEEN',
      cardinality: 2,
      isSpecialRange: true, // to show 1 range widget instead of 2
      formatOp: (field, op, values, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay) => {
          let valFrom = values.first();
          let valTo = values.get(1);
          if (isForDisplay)
              return `${field} >= ${valFrom} AND ${field} <= ${valTo}`;
          else
              return `${field} >= ${valFrom} && ${field} <= ${valTo}`;
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
      reversedOp: 'range_not_between',
  },
  range_not_between: {
      label: 'Not between',
      labelForFormat: 'NOT BETWEEN',
      cardinality: 2,
      isSpecialRange: true, // to show 1 range widget instead of 2
      mongoFormatOp: (field, op, values) => ({ [field]: { '$not': { '$gte': values[0], '$lte': values[1] } } }),
      valueLabels: [
          'Value from',
          'Value to'
      ],
      textSeparators: [
          null,
          'and'
      ],
      reversedOp: 'range_between',
  },
  is_empty: {
      isUnary: true,
      label: 'Is empty',
      labelForFormat: 'IS EMPTY',
      cardinality: 0,
      reversedOp: 'is_not_empty',
      formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          return isForDisplay ? `${field} IS EMPTY` : `!${field}`;
      },
      mongoFormatOp: (field, op) => ({ [field]: { '$exists': false } }),
  },
  is_not_empty: {
      isUnary: true,
      label: 'Is not empty',
      labelForFormat: 'IS NOT EMPTY',
      cardinality: 0,
      reversedOp: 'is_empty',
      formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          return isForDisplay ? `${field} IS NOT EMPTY` : `!!${field}`;
      },
      mongoFormatOp: (field, op) => ({ [field]: { '$exists': true } }),
  },
  select_equals: {
      label: '==',
      labelForFormat: '==',
      formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          return `${field} == ${value}`;
      },
      mongoFormatOp: (field, op, value) => ({ [field]: { '$eq': value } }),
      reversedOp: 'select_not_equals',
  },
  select_not_equals: {
      label: '!=',
      labelForFormat: '!=',
      formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          return `${field} != ${value}`;
      },
      mongoFormatOp: (field, op, value) => ({ [field]: { '$ne': value } }),
      reversedOp: 'select_equals',
  },
  select_any_in: {
      label: 'Any in',
      labelForFormat: 'IN',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          if (valueSrc == 'value')
              return `${field} IN (${values.join(', ')})`;
          else
              return `${field} IN (${values})`;
      },
      mongoFormatOp: (field, op, values) => ({ [field]: { '$in': values } }),
      reversedOp: 'select_not_any_in',
  },
  select_not_any_in: {
      label: 'Not in',
      labelForFormat: 'NOT IN',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          if (valueSrc == 'value')
              return `${field} NOT IN (${values.join(', ')})`;
          else
              return `${field} NOT IN (${values})`;
      },
      mongoFormatOp: (field, op, values) => ({ [field]: { '$nin': values } }),
      reversedOp: 'select_any_in',
  },
  multiselect_equals: {
      label: 'Equals',
      labelForFormat: '==',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          if (valueSrc == 'value')
              return `${field} == [${values.join(', ')}]`;
          else
              return `${field} == ${values}`;
      },
      mongoFormatOp: (field, op, values) => ({ [field]: { '$eq': values } }),
      reversedOp: 'multiselect_not_equals',
  },
  multiselect_not_equals: {
      label: 'Not equals',
      labelForFormat: '!=',
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          if (valueSrc == 'value')
              return `${field} != [${values.join(', ')}]`;
          else
              return `${field} != ${values}`;
      },
      mongoFormatOp: (field, op, values) => ({ [field]: { '$ne': values } }),
      reversedOp: 'multiselect_equals',
  },
  proximity: {
      label: 'Proximity search',
      cardinality: 2,
      valueLabels: [
          { label: 'Word 1', placeholder: 'Enter first word' },
          { label: 'Word 2', placeholder: 'Enter second word' },
      ],
      textSeparators: [
          //'Word 1',
          //'Word 2'
      ],
      formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
          let val1 = values.first();
          let val2 = values.get(1);
          return `${field} ${val1} NEAR/${operatorOptions.get('proximity')} ${val2}`;
      },
      mongoFormatOp: (field, op, values) => (undefined), // not supported
      options: {
          optionLabel: "Near", // label on top of "near" selectbox (for config.settings.showLabels==true)
          optionTextBefore: "Near", // label before "near" selectbox (for config.settings.showLabels==false)
          optionPlaceholder: "Select words between", // placeholder for "near" selectbox
          factory: (props) => <ProximityOperator {...props} />,
          minProximity: 2,
          maxProximity: 10,
          defaultProximity: 2,
      }
  },
};

//----------------------------  widgets

const widgets = {
  text: {
      type: "text",
      valueSrc: 'value',
      valueLabel: "String",
      valuePlaceholder: "Enter string",
      factory: (props) => <TextWidget {...props} />,
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          return isForDisplay ? '"' + val + '"' : JSON.stringify(val);
      },
  },
  number: {
      type: "number",
      valueSrc: 'value',
      factory: (props) => <NumberWidget {...props} />,
      valueLabel: "Number",
      valuePlaceholder: "Enter number",
      valueLabels: [
          { label: 'Number from', placeholder: 'Enter number from' },
          { label: 'Number to', placeholder: 'Enter number to' },
      ],
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          return isForDisplay ? val : JSON.stringify(val);
      },
  },
  slider: {
      type: "number",
      valueSrc: 'value',
      factory: (props) => <SliderWidget {...props} />,
      valueLabel: "Number",
      valuePlaceholder: "Enter number or move slider",
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          return isForDisplay ? val : JSON.stringify(val);
      },
  },
  rangeslider: {
      type: "number",
      valueSrc: 'value',
      factory: (props) => <RangeWidget {...props} />,
      valueLabel: "Range",
      valuePlaceholder: "Select range",
      valueLabels: [
          { label: 'Number from', placeholder: 'Enter number from' },
          { label: 'Number to', placeholder: 'Enter number to' },
      ],
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          return isForDisplay ? val : JSON.stringify(val);
      },
      singleWidget: 'slider',
  },
  select: {
      type: "select",
      valueSrc: 'value',
      factory: (props) => <SelectWidget {...props} />,
      valueLabel: "Value",
      valuePlaceholder: "Select value",
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          let valLabel = fieldDef.listValues[val];
          return isForDisplay ? '"' + valLabel + '"' : JSON.stringify(val);
      },
  },
  multiselect: {
      type: "multiselect",
      valueSrc: 'value',
      factory: (props) => <MultiSelectWidget {...props} />,
      valueLabel: "Values",
      valuePlaceholder: "Select values",
      formatValue: (vals, fieldDef, wgtDef, isForDisplay) => {
          let valsLabels = vals.map(v => fieldDef.listValues[v]);
          return isForDisplay ? valsLabels.map(v => '"' + v + '"') : vals.map(v => JSON.stringify(v));
      },
  },
  date: {
      type: "date",
      valueSrc: 'value',
      factory: (props) => <DateWidget {...props} />,
      dateFormat: 'DD.MM.YYYY',
      valueFormat: 'YYYY-MM-DD',
      valueLabel: "Date",
      valuePlaceholder: "Enter date",
      valueLabels: [
          { label: 'Date from', placeholder: 'Enter date from' },
          { label: 'Date to', placeholder: 'Enter date to' },
      ],
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          let dateVal = moment(val, wgtDef.valueFormat);
          return isForDisplay ? '"' + dateVal.format(wgtDef.dateFormat) + '"' : JSON.stringify(val);
      },
  },
  time: {
      type: "time",
      valueSrc: 'value',
      factory: (props) => <TimeWidget {...props} />,
      timeFormat: 'HH:mm',
      valueFormat: 'HH:mm:ss',
      valueLabel: "Time",
      valuePlaceholder: "Enter time",
      valueLabels: [
          { label: 'Time from', placeholder: 'Enter time from' },
          { label: 'Time to', placeholder: 'Enter time to' },
      ],
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          let dateVal = moment(val, wgtDef.valueFormat);
          return isForDisplay ? '"' + dateVal.format(wgtDef.timeFormat) + '"' : JSON.stringify(val);
      },
  },
  datetime: {
      type: "datetime",
      valueSrc: 'value',
      factory: (props) => <DateTimeWidget {...props} />,
      timeFormat: 'HH:mm',
      dateFormat: 'DD.MM.YYYY',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      valueLabel: "Datetime",
      valuePlaceholder: "Enter datetime",
      valueLabels: [
          { label: 'Datetime from', placeholder: 'Enter datetime from' },
          { label: 'Datetime to', placeholder: 'Enter datetime to' },
      ],
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          let dateVal = moment(val, wgtDef.valueFormat);
          return isForDisplay ? '"' + dateVal.format(wgtDef.dateFormat + ' ' + wgtDef.timeFormat) + '"' : JSON.stringify(val);
      },
  },
  boolean: {
      type: "boolean",
      valueSrc: 'value',
      factory: (props) => <BooleanWidget {...props} />,
      labelYes: "Yes",
      labelNo: "No",
      formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
          return isForDisplay ? (val ? "Yes" : "No") : JSON.stringify(!!val);
      },
      defaultValue: false,
  },
  field: {
      valueSrc: 'field',
      factory: (props) => <ValueFieldWidget {...props} />,
      formatValue: (val, fieldDef, wgtDef, isForDisplay, valFieldDef) => {
          return isForDisplay ? (valFieldDef.label || val) : val;
      },
      valueLabel: "Field to compare",
      valuePlaceholder: "Select field to compare",
      customProps: {
          showSearch: true
      }
  }
};

//----------------------------  types

const types = {
  text: {
      defaultOperator: 'equal',
      widgets: {
          text: {
              operators: [
                  'equal',
                  'not_equal',
                  'is_empty',
                  'is_not_empty',
                  'proximity'
              ],
              widgetProps: {},
              opProps: {},
          },
          field: {
              operators: [
                  //unary ops (like `is_empty`) will be excluded anyway, see getWidgetsForFieldOp()
                  'equal',
                  'not_equal',
                  'proximity', //can exclude if you want
              ],
          }
      },
  },
  number: {
      defaultOperator: 'equal',
      mainWidget: 'number',
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
                  "is_empty",
                  "is_not_empty",
              ],
          },
          slider: {
              operators: [
                  "equal",
                  "not_equal",
                  "less",
                  "less_or_equal",
                  "greater",
                  "greater_or_equal",
                  "is_empty",
                  "is_not_empty",
              ],
          },
          rangeslider: {
              operators: [
                  "range_between",
                  "range_not_between",
                  "is_empty",
                  "is_not_empty",
              ],
          }
      },
  },
  date: {
      defaultOperator: 'equal',
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
      defaultOperator: 'equal',
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
     defaultOperator: 'equal',
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
          }
      },
  },
  select: {
      mainWidget: "select",
      defaultOperator: 'select_equals',
      widgets: {
          select: {
              operators: [
                  'select_equals',
                  'select_not_equals'
              ],
              widgetProps: {
                  customProps: {
                      showSearch: true
                  }
              },
          },
          multiselect: {
              operators: [
                  'select_any_in',
                  'select_not_any_in'
              ],
          },
      },
  },
  multiselect: {
      defaultOperator: 'multiselect_equals',
      widgets: {
          multiselect: {
              operators: [
                  'multiselect_equals',
                  'multiselect_not_equals',
              ]
          }
      },
  },
  boolean: {
      defaultOperator: 'equal',
      widgets: {
          boolean: {
              operators: [
                  "equal",
                  "not_equal",
              ],
              widgetProps: {
                  //you can enable this if you don't use fields as value sources
                  // hideOperator: true,
                  // operatorInlineLabel: "is",
              }
          },
          field: {
              operators: [
                  "equal",
                  "not_equal",
              ],
          }
      },
  },
};

//----------------------------  settings

const settings = {
  ...defaultSettings,

  formatField: (field, parts, label2, fieldDefinition, config, isForDisplay) => {
      if (isForDisplay)
          return label2;
      else
          return field;
  },
  formatReverse: (q, operator, reversedOp, operatorDefinition, revOperatorDefinition, isForDisplay) => {
    if (isForDisplay)
        return "NOT(" + q + ")";
    else
        return "!(" + q + ")";
  },
  canCompareFieldWithField: (leftField, leftFieldConfig, rightField, rightFieldConfig) => {
      //for type == 'select'/'multiselect' you can check listValues
      return true;
  },

  // enable compare fields
  valueSourcesInfo: {
      value: {
          label: "Value"
      },
      field: {
          label: "Field",
          widget: "field",
      }
  },
  customFieldSelectProps: {
      showSearch: true
  },
};

//----------------------------

export default {
  conjunctions,
  operators,
  widgets,
  types,
  settings,
};
