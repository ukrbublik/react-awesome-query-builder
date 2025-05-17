import React from "react";
import { BasicConfig, Utils } from "@react-awesome-query-builder/ui";
import { default as MuiWidgets } from "../widgets";


const settings = {
  ...BasicConfig.settings,

  renderField: (props, {RCE, W: {MuiFieldAutocomplete, MuiFieldSelect}}) => props?.customProps?.showSearch 
    ? RCE(MuiFieldAutocomplete, props)
    : RCE(MuiFieldSelect, props),
  renderOperator: (props, {RCE, W: {MuiFieldAutocomplete, MuiFieldSelect}}) => props?.customProps?.showSearch 
    ? RCE(MuiFieldAutocomplete, props)
    : RCE(MuiFieldSelect, props),
  renderFunc: (props, {RCE, W: {MuiFieldSelect}}) => RCE(MuiFieldSelect, props),
  renderConjs: (props, {RCE, W: {MuiConjs}}) => RCE(MuiConjs, props),
  renderSwitch: (props, {RCE, W: {MuiSwitch}}) => RCE(MuiSwitch, props),
  renderButton: (props, {RCE, W: {MuiButton}}) => RCE(MuiButton, props),
  renderIcon: (props, {RCE, W: {MuiIcon}}) => RCE(MuiIcon, props),
  renderButtonGroup: (props, {RCE, W: {MuiButtonGroup}}) => RCE(MuiButtonGroup, props),
  renderValueSources: (props, {RCE, W: {MuiValueSources}}) => RCE(MuiValueSources, props),
  renderFieldSources: (props, {RCE, W: {MuiValueSources}}) => RCE(MuiValueSources, props),
  renderProvider: (props, {RCE, W: {MuiProvider}}) => RCE(MuiProvider, props),
  renderConfirm: (props, {W: {MuiConfirm}}) => MuiConfirm(props),
  useConfirm: ({W: {MuiUseConfirm}}) => MuiUseConfirm(),
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
  price: {
    ...BasicConfig.widgets.price,
    factory: (props, { RCE, W: { MuiPriceWidget } }) => RCE(MuiPriceWidget, props),
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props, {RCE, W: {MuiAutocompleteWidget, MuiMultiSelectWidget}}) => {
      return (props.asyncFetch || props.showSearch || props.allowCustomValues) 
        ? RCE(MuiAutocompleteWidget, {...props, multiple: true}) 
        : RCE(MuiMultiSelectWidget, props);
    },
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props, {RCE, W: {MuiAutocompleteWidget, MuiSelectWidget}}) => {
      return (props.asyncFetch || props.showSearch || props.allowCustomValues) 
        ? RCE(MuiAutocompleteWidget, props) 
        : RCE(MuiSelectWidget, props);
    },
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
    ...BasicConfig.widgets.rangeslider,
    factory: (props, {RCE, W: {MuiRangeWidget}}) => RCE(MuiRangeWidget, props),
  },
};

const types = {
  ...BasicConfig.types,
};

const ctx = {
  ...BasicConfig.ctx,
  W: {
    ...BasicConfig.ctx.W,
    ...MuiWidgets,
  },
};


let config = {
  ...BasicConfig,
  ctx,
  types,
  widgets,
  settings,
};
config = Utils.ConfigMixins.addMixins(config, [
  "rangeslider",
]);

export default config;
