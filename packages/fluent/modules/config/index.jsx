import React from "react";
import FluentUIWidgets from "../widgets";
import { BasicConfig } from "@react-awesome-query-builder/ui";


const {
  FluentUIBooleanWidget,
  FluentUITextWidget,
  FluentUITextAreaWidget, 
  FluentUIDateWidget,
  FluentUITimeWidget,
  FluentUIDateTimeWidget,
  FluentUIMultiSelectWidget,
  FluentUISelectWidget,
  FluentUINumberWidget,
  FluentUISliderWidget,

  FluentUIFieldSelect,
  FluentUIConjs,
  FluentUIButton,
  FluentUIButtonGroup,
  FluentUIValueSources,

  FluentUIProvider,
  FluentUIConfirm,
} = FluentUIWidgets;


const settings = {
  ...BasicConfig.settings,

  renderField: (props) => <FluentUIFieldSelect {...props} />,
  renderOperator: (props) => <FluentUIFieldSelect {...props} />,
  renderFunc: (props) => <FluentUIFieldSelect {...props} />,
  renderConjs: (props) => <FluentUIConjs {...props} />,
  renderButton: (props) => <FluentUIButton {...props} />,
  renderButtonGroup: (props) => <FluentUIButtonGroup {...props} />,
  renderValueSources: (props) => <FluentUIValueSources {...props} />,
  renderProvider: (props) => <FluentUIProvider {...props} />,
  renderConfirm: FluentUIConfirm,
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props) => <FluentUITextWidget {...props} />,
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props) => <FluentUITextAreaWidget {...props} />,
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props) => <FluentUINumberWidget {...props} />,
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props) => <FluentUIMultiSelectWidget {...props} />,
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props) => <FluentUISelectWidget {...props} />,
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props) => <FluentUISliderWidget {...props} />,
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props) => <FluentUIBooleanWidget {...props} />,
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props) => <FluentUIDateWidget {...props} />,
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props) => <FluentUITimeWidget {...props} />,
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props) => <FluentUIDateTimeWidget {...props} />,
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
