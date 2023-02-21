import React from "react";
import MuiWidgets from "../widgets";
import { Utils, BasicConfig } from "@react-awesome-query-builder/ui";


const settings = {
  ...BasicConfig.settings,

  renderField: {
    if: [
      { var: "props.customProps.showSearch" },
      { RE: ["MuiFieldAutocomplete", {var: "props"}] },
      { RE: ["MuiFieldSelect", {var: "props"}] },
    ]
  }, 
  renderOperator: (props, {RCE, W: {MuiFieldSelect}}) => RCE(MuiFieldSelect, props),
  renderFunc: (props, {RCE, W: {MuiFieldSelect}}) => RCE(MuiFieldSelect, props),
  renderConjs: (props, {RCE, W: {MuiConjs}}) => RCE(MuiConjs, props),
  renderSwitch: (props, {RCE, W: {MuiSwitch}}) => RCE(MuiSwitch, props),
  renderButton: (props, {RCE, W: {MuiButton}}) => RCE(MuiButton, props),
  renderButtonGroup: (props, {RCE, W: {MuiButtonGroup}}) => RCE(MuiButtonGroup, props),
  renderValueSources: (props, {RCE, W: {MuiValueSources}}) => RCE(MuiValueSources, props),
  renderProvider: (props, {RCE, W: {MuiProvider}}) => RCE(MuiProvider, props),
  renderConfirm: { RE: ["MuiConfirm", {var: "props"}] },
  useConfirm: { RE: ["MuiUseConfirm"] },
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props, {RCE, W: {MuiTextWidget}}) => RCE(MuiTextWidget, props),
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props, {RCE, W: {MuiTextAreaWidget}}) => RCE(MuiTextAreaWidget, props),
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props, {RCE, W: {MuiNumberWidget}}) => RCE(MuiNumberWidget, props),
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: {
      if: [
        { or: [ { var: "props.asyncFetch" }, { var: "props.showSearch" } ] },
        { RE: ["MuiAutocompleteWidget", { MERGE: [
          { var: "props" },
          { MAP: [ [ [ "multiple", true ] ] ] }
        ]}] },
        { RE: ["MuiMultiSelectWidget", {var: "props"}] }
      ]
    }
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: {
      if: [
        { or: [ { var: "props.asyncFetch" }, { var: "props.showSearch" } ] },
        { RE: ["MuiAutocompleteWidget", {var: "props"}] },
        { RE: ["MuiSelectWidget", {var: "props"}] }
      ]
    }
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props, {RCE, W: {MuiSliderWidget}}) => RCE(MuiSliderWidget, props),
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props, {RCE, W: {MuiBooleanWidget}}) => RCE(MuiBooleanWidget, props),
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props, {RCE, W: {MuiDateWidget}}) => RCE(MuiDateWidget, props),
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props, {RCE, W: {MuiTimeWidget}}) => RCE(MuiTimeWidget, props),
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props, {RCE, W: {MuiDateTimeWidget}}) => RCE(MuiDateTimeWidget, props),
  },

  rangeslider: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    factory: (props, {RCE, W: {MuiRangeWidget}}) => RCE(MuiRangeWidget, props),
    valueLabel: "Range",
    valuePlaceholder: "Select range",
    valueLabels: [
      { label: "Number from", placeholder: "Enter number from" },
      { label: "Number to", placeholder: "Enter number to" },
    ],
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay ? this.stringifyForDisplay(val) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      return this.SqlString.escape(val);
    },
    singleWidget: "slider",
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
          "is_empty",
          "is_not_empty",
        ],
      }
    },
  },
};

const ctx = {
  ...BasicConfig.ctx,
  W: {
    ...BasicConfig.ctx.W,
    ...MuiWidgets,
  },
};

export default {
  ...BasicConfig,
  ctx,
  types,
  widgets,
  settings,
};