import React from "react";
import en_US from "antd/es/locale/en_US";
import {default as AntdWidgets} from "../widgets";
import { normalizeListValues } from "../utils/stuff";
import { BasicConfig, Utils } from "@react-awesome-query-builder/ui";



const settings = {
  ...BasicConfig.settings,

  renderField: (props, {RCE, W: {FieldSelect}}) => RCE(FieldSelect, props),
  // renderField: (props, {RCE, W: {FieldDropdown}}) => RCE(FieldDropdown, props),
  // renderField: (props, {RCE, W: {FieldCascader}}) => RCE(FieldCascader, props),
  // renderField: (props, {RCE, W: {FieldTreeSelect}}) => RCE(FieldTreeSelect, props),

  renderOperator: (props, {RCE, W: {FieldSelect}}) => RCE(FieldSelect, props),
  // renderOperator: (props, {RCE, W: {FieldDropdown}}) => RCE(FieldDropdown, props),

  renderFunc: (props, {RCE, W: {FieldSelect}}) => RCE(FieldSelect, props),
  renderConjs: (props, {RCE, W: {Conjs}}) => RCE(Conjs, props),
  renderSwitch: (props, {RCE, W: {Switch}}) => RCE(Switch, props),
  renderButton: (props, {RCE, W: {Button}}) => RCE(Button, props),
  renderIcon: (props, {RCE, W: {Icon}}) => RCE(Icon, props),
  renderButtonGroup: (props, {RCE, W: {ButtonGroup}}) => RCE(ButtonGroup, props),
  renderValueSources: (props, {RCE, W: {ValueSources}}) => RCE(ValueSources, props),
  renderFieldSources: (props, {RCE, W: {ValueSources}}) => RCE(ValueSources, props),
  renderProvider: (props, {RCE, W: {Provider}}) => RCE(Provider, props),
  renderConfirm: (props, {W: {confirm}}) => confirm(props),

  // localization
  locale: {
    ...BasicConfig.settings.locale,
    // antd: en_US,
  },

  removeInvalidMultiSelectValuesOnLoad: false, // can be removed manually in UI
  normalizeListValues: function(...args) { return this.utils.normalizeListValues.call(null, ...args); },
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
  price: {
    ...BasicConfig.widgets.price,
    factory: (props, {RCE, W: {PriceWidget}}) => RCE(PriceWidget, props),
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
      return (props.asyncFetch || props.showSearch || props.allowCustomValues) 
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
    ...BasicConfig.widgets.rangeslider,
    factory: (props, {RCE, W: {RangeWidget}}) => RCE(RangeWidget, props),
  },
  treeselect: {
    ...BasicConfig.widgets.treeselect,
    factory: (props, {RCE, W: {TreeSelectWidget}}) => RCE(TreeSelectWidget, props),
  },
  treemultiselect: {
    ...BasicConfig.widgets.treemultiselect,
    factory: (props, {RCE, W: {TreeSelectWidget}}) => RCE(TreeSelectWidget, {...props, treeMultiple: true}),
  },
};


const types = {
  ...BasicConfig.types,
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

let config = {
  ...BasicConfig,
  ctx,
  types,
  widgets,
  settings,
};
config = Utils.ConfigMixins.addMixins(config, [
  "rangeslider",
  "treeselect",
  "treemultiselect",
  "rangeable__date",
]);

export default config;
