import React from "react";
import FluentUIWidgets from "../widgets";
import { BasicConfig, Utils } from "@react-awesome-query-builder/ui";


const settings = {
  ...BasicConfig.settings,

  renderField: (props, {RCE, W: {FluentUIFieldSelect}}) => RCE(FluentUIFieldSelect, props),
  renderOperator: (props, {RCE, W: {FluentUIFieldSelect}}) => RCE(FluentUIFieldSelect, props),
  renderFunc: (props, {RCE, W: {FluentUIFieldSelect}}) => RCE(FluentUIFieldSelect, props),
  renderConjs: (props, {RCE, W: {FluentUIConjs}}) => RCE(FluentUIConjs, props),
  renderButton: (props, {RCE, W: {FluentUIButton}}) => RCE(FluentUIButton, props),
  renderIcon: (props, {RCE, W: {FluentUIIcon}}) => RCE(FluentUIIcon, props),
  renderButtonGroup: (props, {RCE, W: {FluentUIButtonGroup}}) => RCE(FluentUIButtonGroup, props),
  renderValueSources: (props, {RCE, W: {FluentUIValueSources}}) => RCE(FluentUIValueSources, props),
  renderFieldSources: (props, {RCE, W: {FluentUIValueSources}}) => RCE(FluentUIValueSources, props),
  renderProvider: (props, {RCE, W: {FluentUIProvider}}) => RCE(FluentUIProvider, props),
  renderConfirm: (props, {W: {FluentUIConfirm}}) => FluentUIConfirm(props),
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props, {RCE, W: {FluentUITextWidget}}) => RCE(FluentUITextWidget, props),
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props, {RCE, W: {FluentUITextAreaWidget}}) => RCE(FluentUITextAreaWidget, props),
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props, {RCE, W: {FluentUINumberWidget}}) => RCE(FluentUINumberWidget, props),
  },
  price: {
    ...BasicConfig.widgets.price,
    factory: (props, { RCE, W: { FluentUIPriceWidget } }) =>
      RCE(FluentUIPriceWidget, props),
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props, {RCE, W: {FluentUIMultiSelectWidget}}) => RCE(FluentUIMultiSelectWidget, props),
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props, {RCE, W: {FluentUISelectWidget}}) => RCE(FluentUISelectWidget, props),
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props, {RCE, W: {FluentUISliderWidget}}) => RCE(FluentUISliderWidget, props),
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props, {RCE, W: {FluentUIBooleanWidget}}) => RCE(FluentUIBooleanWidget, props),
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props, {RCE, W: {FluentUIDateWidget}}) => RCE(FluentUIDateWidget, props),
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props, {RCE, W: {FluentUITimeWidget}}) => RCE(FluentUITimeWidget, props),
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props, {RCE, W: {FluentUIDateTimeWidget}}) => RCE(FluentUIDateTimeWidget, props),
  },
};


const types = {
  ...BasicConfig.types,
};

const ctx = {
  ...BasicConfig.ctx,
  W: {
    ...BasicConfig.ctx.W,
    ...FluentUIWidgets,
  },
};


let config = {
  ...BasicConfig,
  ctx,
  types,
  widgets,
  settings,
};
export default config;

