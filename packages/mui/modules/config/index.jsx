import React from "react";
import MuiWidgets from "../widgets";
import { Utils, BasicConfig } from "@react-awesome-query-builder/ui";

const { SqlString, stringifyForDisplay } = Utils.ExportUtils;


const {
  MuiBooleanWidget,
  MuiTextWidget,
  MuiTextAreaWidget,
  MuiDateWidget,
  MuiTimeWidget,
  MuiDateTimeWidget,
  MuiMultiSelectWidget,
  MuiSelectWidget,
  MuiNumberWidget,
  MuiSliderWidget,
  MuiRangeWidget,
  MuiAutocompleteWidget,

  MuiFieldSelect,
  MuiFieldAutocomplete,
  MuiConjs,
  MuiSwitch,
  MuiButton,
  MuiButtonGroup,
  MuiValueSources,

  MuiProvider,
  MuiConfirm,
  MuiUseConfirm,
} = MuiWidgets;


const settings = {
  ...BasicConfig.settings,

  renderField: (props) => props?.customProps?.showSearch 
    ? <MuiFieldAutocomplete {...props} /> 
    : <MuiFieldSelect {...props} />,
  renderFieldSources: (props) => {
    return <MuiValueSources {...props} />;
  },
  renderOperator: (props) => <MuiFieldSelect {...props} />,
  renderFunc: (props) => <MuiFieldSelect {...props} />,
  renderConjs: (props) => <MuiConjs {...props} />,
  renderSwitch: (props) => <MuiSwitch {...props} />,
  renderButton: (props) => <MuiButton {...props} />,
  renderButtonGroup: (props) => <MuiButtonGroup {...props} />,
  renderValueSources: (props) => <MuiValueSources {...props} />,
  renderProvider: (props) => <MuiProvider {...props} />,
  renderConfirm: MuiConfirm,
  useConfirm: MuiUseConfirm,
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props) => <MuiTextWidget {...props} />,
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props) => <MuiTextAreaWidget {...props} />,
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props) => <MuiNumberWidget {...props} />,
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props) => {
      return (props.asyncFetch || props.showSearch) 
        ? <MuiAutocompleteWidget multiple {...props} /> 
        : <MuiMultiSelectWidget {...props} />;
    },
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props) => {
      return (props.asyncFetch || props.showSearch) 
        ? <MuiAutocompleteWidget {...props} /> 
        : <MuiSelectWidget {...props} />;
    },
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props) => <MuiSliderWidget {...props} />,
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props) => <MuiBooleanWidget {...props} />,
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props) => <MuiDateWidget {...props} />,
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props) => <MuiTimeWidget {...props} />,
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props) => <MuiDateTimeWidget {...props} />,
  },

  rangeslider: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    factory: (props) => <MuiRangeWidget {...props} />,
    valueLabel: "Range",
    valuePlaceholder: "Select range",
    valueLabels: [
      { label: "Number from", placeholder: "Enter number from" },
      { label: "Number to", placeholder: "Enter number to" },
    ],
    formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
      return isForDisplay ? stringifyForDisplay(val) : JSON.stringify(val);
    },
    sqlFormatValue: (val, fieldDef, wgtDef, op, opDef) => {
      return SqlString.escape(val);
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

export default {
  ...BasicConfig,
  types,
  widgets,
  settings,
};