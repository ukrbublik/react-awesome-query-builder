import en_US from 'antd/lib/locale-provider/en_US';
import * as Widgets from '../components/widgets';
import React from "react";
const {
  FieldSelect,
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
  VanillaFieldSelect
} = Widgets;

export const settings = {
  formatField: (field, parts, label2, fieldDefinition, config, isForDisplay) => {
    if (isForDisplay)
        return label2;
    else
        return field;
  },

  renderField: (props) => <FieldSelect {...props} />,
  // renderField: (props) => <FieldDropdown {...props} />,
  // renderField: (props) => <FieldCascader {...props} />,
  // renderField: (props) => <FieldTreeSelect {...props} />,
  // renderField: (props) => <VanillaFieldSelect {...props} />,

  renderOperator: (props) => <FieldSelect {...props} />,
  // renderOperator: (props) => <FieldDropdown {...props} />,
  // renderOperator: (props) => <VanillaFieldSelect {...props} />,

  renderFunc: (props) => <FieldSelect {...props} />,

  valueSourcesInfo: {
      value: {},
  },
  fieldSeparator: '.',
  fieldSeparatorDisplay: '.',
  renderSize: "small",
  maxLabelsLength: 100,
  hideConjForOne: true,
  canReorder: true,
  canRegroup: true,
  showNot: true,
  groupActionsPosition: 'topRight', // oneOf [topLeft, topCenter, topRight, bottomLeft, bottomCenter, bottomRight]
  setOpOnChangeField: ['keep', 'default'], // 'default' (default if present), 'keep' (keep prev from last field), 'first', 'none'

  // localization
  locale: {
    short: 'en',
    full: 'en-US',
    antd: en_US,
  },
  valueLabel: "Value",
  valuePlaceholder: "Value",
  fieldLabel: "Field",
  operatorLabel: "Operator",
  funcLabel: "Function",
  fieldPlaceholder: "Select field",
  funcPlaceholder: "Select function",
  operatorPlaceholder: "Select operator",
  deleteLabel: null,
  addGroupLabel: "Add group",
  addRuleLabel: "Add rule",
  delGroupLabel: null,
  notLabel: "Not",
  valueSourcesPopupTitle: "Select value source",
  removeRuleConfirmOptions: null,
  removeGroupConfirmOptions: null,
};
