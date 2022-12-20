import React from "react";
import * as Widgets from "../components/widgets";
import * as CustomOperators from "../components/operators";
import {CoreConfig} from "@react-awesome-query-builder/core";

const {
  //value
  VanillaBooleanWidget,
  VanillaTextWidget,
  VanillaTextAreaWidget,
  VanillaDateWidget,
  VanillaTimeWidget,
  VanillaDateTimeWidget,
  VanillaMultiSelectWidget,
  VanillaSelectWidget,
  VanillaNumberWidget,
  VanillaSliderWidget,

  //core
  VanillaFieldSelect,
  VanillaConjs,
  VanillaButton,
  VanillaButtonGroup,
  VanillaProvider,
  VanillaValueSources,
  vanillaConfirm,
  VanillaSwitch,

  //common
  ValueFieldWidget,
  FuncWidget
} = Widgets;
const { ProximityOperator } = CustomOperators;


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
      factory: (props) => <ProximityOperator {...props} />,
    },
  },
};


//----------------------------  widgets

const widgets = {
  text: {
    ...CoreConfig.widgets.text,
    factory: (props) => <VanillaTextWidget {...props} />,
  },
  textarea: {
    ...CoreConfig.widgets.textarea,
    factory: (props) => <VanillaTextAreaWidget {...props} />,
  },
  number: {
    ...CoreConfig.widgets.number,
    factory: (props) => <VanillaNumberWidget {...props} />,
  },
  slider: {
    ...CoreConfig.widgets.slider,
    factory: (props) => <VanillaSliderWidget {...props} />,
  },
  select: {
    ...CoreConfig.widgets.select,
    factory: (props) => <VanillaSelectWidget {...props} />,
  },
  multiselect: {
    ...CoreConfig.widgets.multiselect,
    factory: (props) => <VanillaMultiSelectWidget {...props} />,
  },
  date: {
    ...CoreConfig.widgets.date,
    factory: (props) => <VanillaDateWidget {...props} />,
  },
  time: {
    ...CoreConfig.widgets.time,
    factory: (props) => <VanillaTimeWidget {...props} />,
  },
  datetime: {
    ...CoreConfig.widgets.datetime,
    factory: (props) => <VanillaDateTimeWidget {...props} />,
  },
  boolean: {
    ...CoreConfig.widgets.boolean,
    factory: (props) => <VanillaBooleanWidget {...props} />,
  },
  field: {
    ...CoreConfig.widgets.field,
    factory: (props) => <ValueFieldWidget {...props} />,
    customProps: {
      showSearch: true
    }
  },
  func: {
    ...CoreConfig.widgets.func,
    factory: (props) => <FuncWidget {...props} />,
    customProps: {
      //showSearch: true
    }
  },
  case_value: {
    ...CoreConfig.widgets.case_value,
    factory: ({value, setValue}) =>  
      <input 
        type="text" 
        value={value || ""} 
        onChange={e => setValue(e.target.value)} 
      />
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

  renderField: (props) => <VanillaFieldSelect {...props} />,
  renderOperator: (props) => <VanillaFieldSelect {...props} />,
  renderFunc: (props) => <VanillaFieldSelect {...props} />,
  renderConjs: (props) => <VanillaConjs {...props} />,
  renderSwitch: (props) => <VanillaSwitch {...props} />,
  renderButton: (props) => <VanillaButton {...props} />,
  renderButtonGroup: (props) => <VanillaButtonGroup {...props} />,
  renderProvider: (props) => <VanillaProvider {...props} />,
  renderValueSources: (props) => <VanillaValueSources {...props} />,
  renderConfirm: vanillaConfirm,
  renderSwitchPrefix: () => <>{"Conditions"}</>,

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

export default {
  conjunctions,
  operators,
  widgets,
  types,
  settings,
};
