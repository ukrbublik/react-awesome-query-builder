import React from "react";
import en_US from "antd/es/locale/en_US";
import AntdWidgets from "../widgets";
import { normalizeListValues } from "../utils/stuff";
import { Utils, BasicConfig } from "@react-awesome-query-builder/ui";



const settings = {
  ...BasicConfig.settings,

  renderField: (props, {RCE, W: {FieldSelect}}) => RCE(FieldSelect, props),
  // renderField: (props, {RCE, W: {FieldDropdown}}) => RCE(FieldSelect, props),
  // renderField: (props, {RCE, W: {FieldCascader}}) => RCE(FieldSelect, props),
  // renderField: (props, {RCE, W: {FieldTreeSelect}}) => RCE(FieldSelect, props),

  renderOperator: (props, {RCE, W: {FieldSelect}}) => RCE(FieldSelect, props),
  // renderOperator: (props, {RCE, W: {FieldDropdown}}) => RCE(FieldDropdown, props),

  renderFunc: (props, {RCE, W: {FieldSelect}}) => RCE(FieldSelect, props),
  renderConjs: (props, {RCE, W: {Conjs}}) => RCE(Conjs, props),
  renderSwitch: (props, {RCE, W: {Switch}}) => RCE(Switch, props),
  renderButton: (props, {RCE, W: {Button}}) => RCE(Button, props),
  renderButtonGroup: (props, {RCE, W: {ButtonGroup}}) => RCE(ButtonGroup, props),
  renderValueSources: (props, {RCE, W: {ValueSources}}) => RCE(ValueSources, props),
  renderProvider: (props, {RCE, W: {Provider}}) => RCE(Provider, props),
  renderConfirm: (props, {W: {confirm}}) => confirm(props),

  // localization
  locale: {
    ...BasicConfig.settings.locale,
    // antd: en_US,
  },

  removeInvalidMultiSelectValuesOnLoad: false, // can be removed manually in UI
  normalizeListValues: function(...args) { return this.utils.normalizeListValues.call(null, ...args) },
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props, {RCE, W: {TextWidget}}) => RCE(TextWidget, props),
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props, {RCE, W: {TextAreaWidget}}) => RCE(TextAreaWidget, props),
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props, {RCE, W: {NumberWidget}}) => RCE(NumberWidget, props),
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props, {RCE, W: {AutocompleteWidget, MultiSelectWidget}}) => {
      return (props.asyncFetch || props.showSearch) 
        ? RCE(AutocompleteWidget, {...props, multiple: true}) 
        : RCE(MultiSelectWidget, props);
    },
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props, {RCE, W: {AutocompleteWidget, SelectWidget}}) => {
      return (props.asyncFetch || props.showSearch) 
        ? RCE(AutocompleteWidget, props) 
        : RCE(SelectWidget, props);
    },
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props, {RCE, W: {SliderWidget}}) => RCE(SliderWidget, props),
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props, {RCE, W: {BooleanWidget}}) => RCE(BooleanWidget, props),
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props, {RCE, W: {DateWidget}}) => RCE(DateWidget, props),
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props, {RCE, W: {TimeWidget}}) => RCE(TimeWidget, props),
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props, {RCE, W: {DateTimeWidget}}) => RCE(DateTimeWidget, props),
  },

  rangeslider: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    factory: (props, {RCE, W: {RangeWidget}}) => RCE(RangeWidget, props),
    valueLabel: "Range",
    valuePlaceholder: "Select range",
    valueLabels: [
      { label: "Number from", placeholder: "Enter number from" },
      { label: "Number to", placeholder: "Enter number to" },
    ],
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay ? this.utils.stringifyForDisplay(val) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function (val) { return this.utils.spelEscape(val); },
    singleWidget: "slider",
    toJS: (val, fieldSettings) => (val),
  },
  treeselect: {
    type: "treeselect",
    jsType: "string",
    valueSrc: "value",
    factory: (props, {RCE, W: {TreeSelectWidget}}) => RCE(TreeSelectWidget, props),
    valueLabel: "Value",
    valuePlaceholder: "Select value",
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      let valLabel = this.utils.getTitleInListValues(fieldDef.fieldSettings.listValues || fieldDef.asyncListValues, val);
      return isForDisplay ? this.utils.stringifyForDisplay(valLabel) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function (val) { return this.utils.spelEscape(val); },
    toJS: (val, fieldSettings) => (val),
  },
  treemultiselect: {
    type: "treemultiselect",
    jsType: "array",
    valueSrc: "value",
    factory: (props, {RCE, W: {TreeSelectWidget}}) => RCE(TreeSelectWidget, {...props, treeMultiple: true}),
    valueLabel: "Values",
    valuePlaceholder: "Select values",
    formatValue: function (vals, fieldDef, wgtDef, isForDisplay) {
      let valsLabels = vals.map(v => this.utils.getTitleInListValues(fieldDef.fieldSettings.listValues || fieldDef.asyncListValues, v));
      return isForDisplay ? valsLabels.map(this.utils.stringifyForDisplay) : vals.map(JSON.stringify);
    },
    sqlFormatValue: function (vals, fieldDef, wgtDef, op, opDef) {
      return vals.map(v => this.utils.SqlString.escape(v));
    },
    spelFormatValue: function (val) { return this.utils.spelEscape(val); },
    toJS: (val, fieldSettings) => (val),
  },
};


const types = {
  ...BasicConfig.types,
  number: {
    ...BasicConfig.types.number,
    widgets: {
      ...BasicConfig.types.number.widgets,
      rangeslider: {
        opProps: {
          between: {
            isSpecialRange: true,
          },
          not_between: {
            isSpecialRange: true,
          }
        },
        operators: [
          "between",
          "not_between",
          "is_null",
          "is_not_null",
        ],
      }
    },
  },
  date: {
    ...BasicConfig.types.date,
    widgets: {
      date: {
        ...BasicConfig.types.date.widgets.date,
        opProps: {
          between: {
            isSpecialRange: true,
            textSeparators: [null, null],
          },
          not_between: {
            isSpecialRange: true,
            textSeparators: [null, null],
          }
        },
      }
    },
  },
  treeselect: {
    mainWidget: "treeselect",
    defaultOperator: "select_equals",
    widgets: {
      treeselect: {
        operators: [
          "select_equals",
          "select_not_equals"
        ],
      },
      treemultiselect: {
        operators: [
          "select_any_in",
          "select_not_any_in"
        ],
      },
    },
  },
  treemultiselect: {
    defaultOperator: "multiselect_equals",
    widgets: {
      treemultiselect: {
        operators: [
          "multiselect_equals",
          "multiselect_not_equals",
        ],
      }
    },
  },
};

const ctx = {
  ...BasicConfig.ctx,
  utils: {
    ...BasicConfig.ctx.utils,
    normalizeListValues,
  },
  W: {
    ...BasicConfig.ctx.W,
    ...AntdWidgets,
  },
};

export default {
  ...BasicConfig,
  ctx,
  types,
  widgets,
  settings,
};