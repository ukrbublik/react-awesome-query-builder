import en_US from "antd/lib/locale-provider/en_US";
import AntdWidgets from "../../components/widgets/antd";
import BasicConfig, { stringifyForDisplay } from "../basic";
import { getTitleInListValues } from "../../utils/stuff";
import { SqlString, spelEscape } from "../../utils/export";
import React from "react";


const {
  FieldSelect,
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
  Button,
  ButtonGroup,
  Conjs,
  Switch,
  ValueSources,

  Provider,
  confirm,
} = AntdWidgets;
const {
  TextWidget,
  TextAreaWidget,
  NumberWidget,
  SliderWidget,
  RangeWidget,
  SelectWidget,
  MultiSelectWidget,
  AutocompleteWidget,
  TreeSelectWidget,
  DateWidget,
  BooleanWidget,
  TimeWidget,
  DateTimeWidget,
} = AntdWidgets;


const settings = {
  ...BasicConfig.settings,

  renderField: (props) => <FieldSelect {...props} />,
  // renderField: (props) => <FieldDropdown {...props} />,
  // renderField: (props) => <FieldCascader {...props} />,
  // renderField: (props) => <FieldTreeSelect {...props} />,

  renderOperator: (props) => <FieldSelect {...props} />,
  // renderOperator: (props) => <FieldDropdown {...props} />,

  renderFunc: (props) => <FieldSelect {...props} />,
  renderConjs: (props) => <Conjs {...props} />,
  renderSwitch: (props) => <Switch {...props} />,
  renderButton: (props) => <Button {...props} />,
  renderButtonGroup: (props) => <ButtonGroup {...props} />,
  renderValueSources: (props) => <ValueSources {...props} />,
  renderProvider: (props) => <Provider {...props} />,
  renderConfirm: confirm,

  // localization
  locale: {
    ...BasicConfig.settings.locale,
    antd: en_US,
  },

  removeInvalidMultiSelectValuesOnLoad: false, // can be removed manually in UI
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props) => <TextWidget {...props} />,
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props) => <TextAreaWidget {...props} />,
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props) => <NumberWidget {...props} />,
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props) => {
      return (props.asyncFetch || props.showSearch)
        ? <AutocompleteWidget multiple {...props} />
        : <MultiSelectWidget {...props} />;
    },
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props) => {
      return (props.asyncFetch || props.showSearch)
        ? <AutocompleteWidget {...props} />
        : <SelectWidget {...props} />;
    },
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props) => <SliderWidget {...props} />,
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props) => <BooleanWidget {...props} />,
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props) => <DateWidget {...props} />,
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props) => <TimeWidget {...props} />,
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props) => <DateTimeWidget {...props} />,
  },

  rangeslider: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    factory: (props) => <RangeWidget {...props} />,
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
    spelFormatValue: (val) => spelEscape(val),
    singleWidget: "slider",
    toJS: (val, fieldSettings) => (val),
  },
  treeselect: {
    type: "treeselect",
    jsType: "string",
    valueSrc: "value",
    factory: (props) => <TreeSelectWidget {...props} />,
    valueLabel: "Value",
    valuePlaceholder: "Select value",
    formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
      let valLabel = getTitleInListValues(fieldDef.fieldSettings.listValues || fieldDef.asyncListValues, val);
      return isForDisplay ? stringifyForDisplay(valLabel) : JSON.stringify(val);
    },
    sqlFormatValue: (val, fieldDef, wgtDef, op, opDef) => {
      return SqlString.escape(val);
    },
    spelFormatValue: (val) => spelEscape(val),
    toJS: (val, fieldSettings) => (val),
  },
  treemultiselect: {
    type: "treemultiselect",
    jsType: "array",
    valueSrc: "value",
    factory: (props) => <TreeSelectWidget {...props} treeMultiple={true} />,
    valueLabel: "Values",
    valuePlaceholder: "Select values",
    formatValue: (vals, fieldDef, wgtDef, isForDisplay) => {
      let valsLabels = vals.map(v => getTitleInListValues(fieldDef.fieldSettings.listValues || fieldDef.asyncListValues, v));
      return isForDisplay ? valsLabels.map(stringifyForDisplay) : vals.map(JSON.stringify);
    },
    sqlFormatValue: (vals, fieldDef, wgtDef, op, opDef) => {
      return vals.map(v => SqlString.escape(v));
    },
    spelFormatValue: (val) => spelEscape(val),
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
          "is_null",
          "is_not_null",
        ],
      }
    },
  },
  date: {
    ...BasicConfig.types.date,
    widgets: {
      date: {
        ...BasicConfig.types.date.widgets.date,
        opProps: {
          between: {
            isSpecialRange: true,
            textSeparators: [null, null],
          },
          not_between: {
            isSpecialRange: true,
            textSeparators: [null, null],
          }
        },
      }
    },
  },
  treeselect: {
    mainWidget: "treeselect",
    defaultOperator: "select_equals",
    widgets: {
      treeselect: {
        operators: [
          "select_equals",
          "select_not_equals"
        ],
      },
      treemultiselect: {
        operators: [
          "select_any_in",
          "select_not_any_in"
        ],
      },
    },
  },
  treemultiselect: {
    defaultOperator: "multiselect_equals",
    widgets: {
      treemultiselect: {
        operators: [
          "multiselect_equals",
          "multiselect_not_equals",
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