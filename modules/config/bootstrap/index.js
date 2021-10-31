import BootstrapWidgets from "../../components/widgets/bootstrap";
import BasicConfig, {stringifyForDisplay} from "../basic";
import React from "react";
import {SqlString} from "../../utils/sql";


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
  BootstrapUseConfirm,
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
  useConfirm: BootstrapUseConfirm,
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

export default {
  ...BasicConfig,
  types,
  widgets,
  settings,
};