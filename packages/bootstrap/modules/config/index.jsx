import React from "react";
import BootstrapWidgets from "../widgets";
import { BasicConfig } from "@react-awesome-query-builder/ui";


const settings = {
  ...BasicConfig.settings,

  renderField: (props, {RCE, W: {BootstrapFieldSelect}}) => RCE(BootstrapFieldSelect, props),
  renderOperator: (props, {RCE, W: {BootstrapFieldSelect}}) => RCE(BootstrapFieldSelect, props),
  renderFunc: (props, {RCE, W: {BootstrapFieldSelect}}) => RCE(BootstrapFieldSelect, props),
  renderConjs: (props, {RCE, W: {BootstrapConjs}}) => RCE(BootstrapConjs, props),
  renderButton: (props, {RCE, W: {BootstrapButton}}) => RCE(BootstrapButton, props),
  renderIcon: (props, {RCE, W: {BootstrapIcon}}) => RCE(BootstrapIcon, props),
  renderButtonGroup: (props, {RCE, W: {BootstrapButtonGroup}}) => RCE(BootstrapButtonGroup, props),
  renderValueSources: (props, {RCE, W: {BootstrapValueSources}}) => RCE(BootstrapValueSources, props),
  renderFieldSources: (props, {RCE, W: {BootstrapValueSources}}) => RCE(BootstrapValueSources, props),
  renderProvider: (props, {RCE, W: {BootstrapProvider}}) => RCE(BootstrapProvider, props),
  renderConfirm: (props, {W: {BootstrapConfirm}}) => BootstrapConfirm(props),
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props, {RCE, W: {BootstrapTextWidget}}) => RCE(BootstrapTextWidget, props),
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props, {RCE, W: {BootstrapTextAreaWidget}}) => RCE(BootstrapTextAreaWidget, props),
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props, {RCE, W: {BootstrapNumberWidget}}) => RCE(BootstrapNumberWidget, props),
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props, {RCE, W: {BootstrapMultiSelectWidget}}) => RCE(BootstrapMultiSelectWidget, props),
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props, {RCE, W: {BootstrapSelectWidget}}) => RCE(BootstrapSelectWidget, props),
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props, {RCE, W: {BootstrapSliderWidget}}) => RCE(BootstrapSliderWidget, props),
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props, {RCE, W: {BootstrapBooleanWidget}}) => RCE(BootstrapBooleanWidget, props),
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props, {RCE, W: {BootstrapDateWidget}}) => RCE(BootstrapDateWidget, props),
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props, {RCE, W: {BootstrapTimeWidget}}) => RCE(BootstrapTimeWidget, props),
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props, {RCE, W: {BootstrapDateTimeWidget}}) => RCE(BootstrapDateTimeWidget, props),
  },
};


const types = {
  ...BasicConfig.types,
};

const ctx = {
  ...BasicConfig.ctx,
  W: {
    ...BasicConfig.ctx.W,
    ...BootstrapWidgets,
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
