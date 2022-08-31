import BootstrapWidgets from "../../components/widgets/bootstrap";
import BasicConfig from "../basic";
import React from "react";

const {
  BootstrapBooleanWidget,
  BootstrapTextWidget,
  BootstrapTextAreaWidget, 
  BootstrapDateWidget,
  BootstrapTimeWidget,
  BootstrapDateTimeWidget,
  BootstrapMultiSelectWidget,
  BootstrapSelectWidget,
  BootstrapNumberWidget,
  BootstrapSliderWidget,

  BootstrapFieldSelect,
  BootstrapConjs,
  BootstrapButton,
  BootstrapButtonGroup,
  BootstrapValueSources,

  BootstrapProvider,
  BootstrapConfirm,
} = BootstrapWidgets;


const settings = {
  ...BasicConfig.settings,

  renderField: (props) => <BootstrapFieldSelect {...props} />,
  renderOperator: (props) => <BootstrapFieldSelect {...props} />,
  renderFunc: (props) => <BootstrapFieldSelect {...props} />,
  renderConjs: (props) => <BootstrapConjs {...props} />,
  renderButton: (props) => <BootstrapButton {...props} />,
  renderButtonGroup: (props) => <BootstrapButtonGroup {...props} />,
  renderValueSources: (props) => <BootstrapValueSources {...props} />,
  renderProvider: (props) => <BootstrapProvider {...props} />,
  renderConfirm: BootstrapConfirm,
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props) => <BootstrapTextWidget {...props} />,
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props) => <BootstrapTextAreaWidget {...props} />,
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props) => <BootstrapNumberWidget {...props} />,
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props) => <BootstrapMultiSelectWidget {...props} />,
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props) => <BootstrapSelectWidget {...props} />,
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props) => <BootstrapSliderWidget {...props} />,
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props) => <BootstrapBooleanWidget {...props} />,
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props) => <BootstrapDateWidget {...props} />,
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props) => <BootstrapTimeWidget {...props} />,
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props) => <BootstrapDateTimeWidget {...props} />,
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