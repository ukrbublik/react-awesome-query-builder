import MaterialWidgets from "../../components/widgets/material";
import BasicConfig from "../basic";
import React from "react";

const {
  MaterialBooleanWidget,
  MaterialTextWidget,
  MaterialDateWidget,
  MaterialTimeWidget,
  MaterialDateTimeWidget,
  MaterialMultiSelectWidget,
  MaterialSelectWidget,
  MaterialNumberWidget,
  MaterialSliderWidget,

  MaterialFieldSelect,
  MaterialConjs,
  MaterialButton,
  MaterialButtonGroup,
  MaterialValueSources,

  MaterialProvider,
  MaterialConfirm,
} = MaterialWidgets;


const settings = {
  ...BasicConfig.settings,

  renderField: (props) => <MaterialFieldSelect {...props} />,
  renderOperator: (props) => <MaterialFieldSelect {...props} />,
  renderFunc: (props) => <MaterialFieldSelect {...props} />,
  renderConjs: (props) => <MaterialConjs {...props} />,
  renderButton: (props) => <MaterialButton {...props} />,
  renderButtonGroup: (props) => <MaterialButtonGroup {...props} />,
  renderValueSources: (props) => <MaterialValueSources {...props} />,
  renderProvider: (props) => <MaterialProvider {...props} />,
  renderConfirm: MaterialConfirm,
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props) => <MaterialTextWidget {...props} />,
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props) => <MaterialNumberWidget {...props} />,
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props) => <MaterialMultiSelectWidget {...props} />,
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props) => <MaterialSelectWidget {...props} />,
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props) => <MaterialSliderWidget {...props} />,
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props) => <MaterialBooleanWidget {...props} />,
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props) => <MaterialDateWidget {...props} />,
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props) => <MaterialTimeWidget {...props} />,
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props) => <MaterialDateTimeWidget {...props} />,
  },
};


const types = {
  ...BasicConfig.types,
};

export default {
  ...BasicConfig,
  types,
  widgets,
  settings,
};