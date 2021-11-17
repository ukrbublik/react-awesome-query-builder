import FluentWidgets from "../../components/widgets/fluent";
import BasicConfig from "../basic";
import React from "react";

const {
  FluentText,

  FluentFieldSelect,
  FluentButton,
  FluentValueSources,
} = FluentWidgets;

const settings = {
  ...BasicConfig.settings,
  renderField: (props) => <FluentFieldSelect {...props} />,
  renderOperator: (props) => <FluentFieldSelect {...props} />,
  renderFunc: (props) => <FluentFieldSelect {...props} />,

  // renderConjs: (props) => <MaterialConjs {...props} />,
  // renderSwitch: (props) => <MaterialSwitch {...props} />,
  renderButton: (props) => <FluentButton {...props} />,
  // renderButtonGroup: (props) => <MaterialButtonGroup {...props} />,
  renderValueSources: (props) => <FluentValueSources {...props} />,
  // renderProvider: (props) => <MaterialProvider {...props} />,
  // renderConfirm: MaterialConfirm,
  // useConfirm: MaterialUseConfirm,
};

const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props) => <FluentText {...props} />,
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