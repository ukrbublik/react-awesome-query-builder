import React, {Component} from "react";
import merge from "lodash/merge";
import {
  BasicConfig, BasicFuncs, Utils,
  // types:
  Operators, Widgets, Fields, Config, Types, Conjunctions, Settings, LocaleSettings, OperatorProximity, Funcs, 
  DateTimeFieldSettings,
} from "react-awesome-query-builder";
import moment from "moment";
import ru_RU from "antd/lib/locale-provider/ru_RU";
import { ruRU } from "@material-ui/core/locale";

import AntdConfig from "react-awesome-query-builder/config/antd";
import AntdWidgets from "react-awesome-query-builder/components/widgets/antd";
import MaterialConfig from "react-awesome-query-builder/config/material";
const {
  FieldSelect,
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
} = AntdWidgets;
const {simulateAsyncFetch} = Utils;

const skinToConfig: Record<string, Config> = {
  vanilla: BasicConfig,
  antd: AntdConfig,
  material: MaterialConfig,
};

export default (skin: string) => {
  const InitialConfig = skinToConfig[skin] as BasicConfig;

  const demoListValues = [
    {title: "A", value: "a"},
    {title: "AA", value: "aa"},
    {title: "AAA1", value: "aaa1"},
    {title: "AAA2", value: "aaa2"},
    {title: "B", value: "b"},
    {title: "C", value: "c"},
    {title: "D", value: "d"},
    {title: "E", value: "e"},
    {title: "F", value: "f"},
    {title: "G", value: "g"},
    {title: "H", value: "h"},
    {title: "I", value: "i"},
    {title: "J", value: "j"},
  ];
  const simulatedAsyncFetch = simulateAsyncFetch(demoListValues, 3);

  const conjunctions: Conjunctions = {
    ...InitialConfig.conjunctions,
  };

  const proximity: OperatorProximity = {
    ...InitialConfig.operators.proximity,
    valueLabels: [
      { label: "Word 1", placeholder: "Enter first word" },
      { label: "Word 2", placeholder: "Enter second word" },
    ],
    textSeparators: [
      //'Word 1',
      //'Word 2'
    ],
    options: {
      ...InitialConfig.operators.proximity.options,
      optionLabel: "Near", // label on top of "near" selectbox (for config.settings.showLabels==true)
      optionTextBefore: "Near", // label before "near" selectbox (for config.settings.showLabels==false)
      optionPlaceholder: "Select words between", // placeholder for "near" selectbox
      minProximity: 2,
      maxProximity: 10,
      defaults: {
        proximity: 2
      },
      customProps: {}
    }
  };

  const operators: Operators = {
    ...InitialConfig.operators,
    // examples of  overriding
    proximity,
    between: {
      ...InitialConfig.operators.between,
      valueLabels: [
        "Value from",
        "Value to"
      ],
      textSeparators: [
        "from",
        "to"
      ],
    },
  };


  const widgets: Widgets = {
    ...InitialConfig.widgets,
    // examples of  overriding
    text: {
      ...InitialConfig.widgets.text
    },
    textarea: {
      ...InitialConfig.widgets.textarea,
      maxRows: 3
    },
    slider: {
      ...InitialConfig.widgets.slider
    },
    rangeslider: {
      ...InitialConfig.widgets.rangeslider
    },
    date: {
      ...InitialConfig.widgets.date,
      dateFormat: "DD.MM.YYYY",
      valueFormat: "YYYY-MM-DD",
    },
    time: {
      ...InitialConfig.widgets.time,
      timeFormat: "HH:mm",
      valueFormat: "HH:mm:ss",
    },
    datetime: {
      ...InitialConfig.widgets.datetime,
      timeFormat: "HH:mm",
      dateFormat: "DD.MM.YYYY",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
    },
    func: {
      ...InitialConfig.widgets.func,
      customProps: {
        showSearch: true
      }
    },
    select: {
      ...InitialConfig.widgets.select,
    },
    multiselect: {
      ...InitialConfig.widgets.multiselect,
      customProps: {
        //showCheckboxes: false,
        width: "200px",
        input: {
          width: "100px"
        }
      }
    },
    treeselect: {
      ...InitialConfig.widgets.treeselect,
      customProps: {
        showSearch: true
      }
    },
  };


  const types: Types = {
    ...InitialConfig.types,
    // examples of  overriding
    boolean: merge(InitialConfig.types.boolean, {
      widgets: {
        boolean: {
          widgetProps: {
            hideOperator: true,
            operatorInlineLabel: "is"
          },
          opProps: {
            equal: {
              label: "is"
            },
            not_equal: {
              label: "is not"
            }
          }
        },
      },
    }),
  };


  const localeSettings: LocaleSettings = {
    locale: {
      moment: "ru",
      antd: ru_RU,
      material: ruRU,
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
    addSubRuleLabel: "Add sub rule",
    delGroupLabel: null,
    notLabel: "Not",
    valueSourcesPopupTitle: "Select value source",
    removeRuleConfirmOptions: {
      title: "Are you sure delete this rule?",
      okText: "Yes",
      okType: "danger",
    },
    removeGroupConfirmOptions: {
      title: "Are you sure delete this group?",
      okText: "Yes",
      okType: "danger",
    },
  };

  const settings: Settings = {
    ...InitialConfig.settings,
    ...localeSettings,

    defaultSliderWidth: "200px",
    defaultSelectWidth: "200px",
    defaultSearchWidth: "100px",
    defaultMaxRows: 5,

    valueSourcesInfo: {
      value: {
        label: "Value"
      },
      field: {
        label: "Field",
        widget: "field",
      },
      func: {
        label: "Function",
        widget: "func",
      }
    },
    // canReorder: true,
    // canRegroup: true,
    // showNot: true,
    // showLabels: true,
    maxNesting: 5,
    canLeaveEmptyGroup: true,
    showErrorMessage: true,
    // renderField: (props) => <FieldCascader {...props} />,
    // renderOperator: (props) => <FieldDropdown {...props} />,
    // renderFunc: (props) => <FieldSelect {...props} />,
    // maxNumberOfRules: 10 // number of rules can be added to the query builder
  };

  //////////////////////////////////////////////////////////////////////

  const fields: Fields = {
    "_created_on": {
      "label": "Created On",
      "type": "date"
    },
    "_last_seen_on": {
      "label": "Last Seen On",
      "type": "date"
    },
    "address": {
      "label": "Address",
      "type": "text",
      "valueSources":["value"]
    },
    "birth_date": {
      "label": "Birth Date",
      "type": "date"
    },
    "birth_day_of_month": {
      "label": "Birth Day Of Month",
      "type": "text"
    },
    "birth_month": {
      "label": "Birth Month",
      "type": "text"
    },
    "company": {
      "label": "Company",
      "type": "text"
    },
    "country": {
      "label": "Country",
      "type": "text"
    },
    "country_code": {
      "label": "Country Code",
      "type": "text"
    },
    "email": {
      "label": "Email",
      "type": "text"
    },
    "gender": {
      "label": "Gender",
      "type": "text"
    },
    "location": {
      "label": "Location",
      "type": "text"
    },
    "loyalty_id": {
      "label": "Loyalty Id",
      "type": "text"
    },
    "mobile_number": {
      "label": "Mobile Number",
      "type": "text"
    },
    "name": {
      "label": "Name",
      "type": "text"
    },
    "points": {
      "label": "Points",
      "type": "number"
    },
    "purchases_count": {
      "label": "Purchases Count",
      "type": "number"
    },
    "purchases_value": {
      "label": "Purchases Value",
      "type": "number"
    },
    "region_id": {
      "label": "Region Id",
      "type": "text"
    },
    "register_on": {
      "label": "Register On",
      "type": "date"
    },
    "source": {
      "label": "Source",
      "type": "text"
    },
    "tags": {
      "label": "Tags",
      "type": "select",
      "fieldSettings": {
        "listValues": [{
          "title": "Loyalty User",
          "value": "loyalty_user"
        }],
        "showSearch": true
      }
    },
    "tier_points": {
      "label": "Tier Points",
      "type": "number"
    }
  }
 

  //////////////////////////////////////////////////////////////////////

  const funcs: Funcs = {
    ...BasicFuncs
  };


  const config: Config = {
    conjunctions,
    operators,
    widgets,
    types,
    settings,
    fields,
    funcs,
  };

  return config;
};

