import React from "react";
import * as Widgets from "../components/widgets";
import * as CustomOperators from "../components/operators";
import { CoreConfig, Utils } from "@react-awesome-query-builder/core";


//----------------------------  conjunctions

const conjunctions = {
  ...CoreConfig.conjunctions,
};

//----------------------------  operators

const operators = {
  ...CoreConfig.operators,
  proximity: {
    ...CoreConfig.operators.proximity,
    options: {
      ...CoreConfig.operators.proximity.options,
      factory: (props, {RCE, O: {ProximityOperator}}) => RCE(ProximityOperator, props),
    },
  },
};


//----------------------------  widgets

const widgets = {
  text: {
    ...CoreConfig.widgets.text,
    factory: (props, {RCE, W: {VanillaTextWidget}}) => RCE(VanillaTextWidget, props),
  },
  textarea: {
    ...CoreConfig.widgets.textarea,
    factory: (props, {RCE, W: {VanillaTextAreaWidget}}) => RCE(VanillaTextAreaWidget, props),
  },
  number: {
    ...CoreConfig.widgets.number,
    factory: (props, {RCE, W: {VanillaNumberWidget}}) => RCE(VanillaNumberWidget, props),
  },
  slider: {
    ...CoreConfig.widgets.slider,
    factory: (props, {RCE, W: {VanillaSliderWidget}}) => RCE(VanillaSliderWidget, props),
  },
  select: {
    ...CoreConfig.widgets.select,
    factory: (props, {RCE, W: {VanillaSelectWidget}}) => RCE(VanillaSelectWidget, props),
  },
  multiselect: {
    ...CoreConfig.widgets.multiselect,
    factory: (props, {RCE, W: {VanillaMultiSelectWidget}}) => RCE(VanillaMultiSelectWidget, props),
  },
  date: {
    ...CoreConfig.widgets.date,
    factory: (props, {RCE, W: {VanillaDateWidget}}) => RCE(VanillaDateWidget, props),
  },
  time: {
    ...CoreConfig.widgets.time,
    factory: (props, {RCE, W: {VanillaTimeWidget}}) => RCE(VanillaTimeWidget, props),
  },
  datetime: {
    ...CoreConfig.widgets.datetime,
    factory: (props, {RCE, W: {VanillaDateTimeWidget}}) => RCE(VanillaDateTimeWidget, props),
  },
  boolean: {
    ...CoreConfig.widgets.boolean,
    factory: (props, {RCE, W: {VanillaBooleanWidget}}) => RCE(VanillaBooleanWidget, props),
  },
  field: {
    ...CoreConfig.widgets.field,
    factory: (props, {RCE, W: {ValueFieldWidget}}) => RCE(ValueFieldWidget, props),
    customProps: {
      showSearch: true
    }
  },
  func: {
    ...CoreConfig.widgets.func,
    factory: (props, {RCE, W: {FuncWidget}}) => RCE(FuncWidget, props),
    customProps: {
      //showSearch: true
    }
  },
  case_value: {
    ...CoreConfig.widgets.case_value,
    // simple text value
    factory: (props, {RCE, W: {VanillaTextWidget}}) =>  RCE(VanillaTextWidget, props),
  }
};

//----------------------------  types

const types = {
  ...CoreConfig.types,
  select: {
    ...CoreConfig.types.select,
    widgets: {
      ...CoreConfig.types.select.widgets,
      select: {
        ...CoreConfig.types.select.widgets.select,
        widgetProps: {
          customProps: {
            showSearch: true
          }
        },
      }
    }
  }
};

//----------------------------  settings

const settings = {
  ...CoreConfig.settings,

  renderField: (props, {RCE, W: {VanillaFieldSelect}}) => RCE(VanillaFieldSelect, props),
  renderOperator: (props, {RCE, W: {VanillaFieldSelect}}) => RCE(VanillaFieldSelect, props),
  renderFunc: (props, {RCE, W: {VanillaFieldSelect}}) => RCE(VanillaFieldSelect, props),
  renderConjs: (props, {RCE, W: {VanillaConjs}}) => RCE(VanillaConjs, props),
  renderSwitch: (props, {RCE, W: {VanillaSwitch}}) => RCE(VanillaSwitch, props),
  renderButton: (props, {RCE, W: {VanillaButton}}) => RCE(VanillaButton, props),
  renderIcon: (props, {RCE, W: {VanillaIcon}}) => RCE(VanillaIcon, props),
  renderButtonGroup: (props, {RCE, W: {VanillaButtonGroup}}) => RCE(VanillaButtonGroup, props),
  renderProvider: (props, {RCE, W: {VanillaProvider}}) => RCE(VanillaProvider, props),
  renderValueSources: (props, {RCE, W: {VanillaValueSources}}) => RCE(VanillaValueSources, props),
  renderFieldSources: (props, {RCE, W: {VanillaValueSources}}) => RCE(VanillaValueSources, props),
  renderConfirm: (props, {W: {vanillaConfirm}}) => vanillaConfirm(props),
  renderSwitchPrefix: "Conditions",

  customFieldSelectProps: {
    showSearch: true
  },

  defaultSliderWidth: "200px",
  defaultSelectWidth: "200px",
  defaultSearchWidth: "100px",
  defaultMaxRows: 5,
  renderSize: "small",
  maxLabelsLength: 100,

  showLock: false,
  showNot: true,
  forceShowConj: false,
  groupActionsPosition: "topRight", // oneOf [topLeft, topCenter, topRight, bottomLeft, bottomCenter, bottomRight]
  
};

//----------------------------

const ctx = {
  ...CoreConfig.ctx,
  W: {
    ...Widgets
  },
  O: {
    ...CustomOperators
  },
  RCE: (C, P) => React.createElement(C, P),
};

//----------------------------

let config = {
  conjunctions,
  operators,
  widgets,
  types,
  settings,
  ctx,
};
config = Utils.ConfigMixins.removeMixins(config, [
  "rangeslider",
  "treeselect",
  "treemultiselect",
]);

export default config;
