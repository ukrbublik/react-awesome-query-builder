import React from "react";
import {
  Config, Fields, Funcs, BasicFuncs, Func, Types, Type, Operator, Operators, Settings,
  SelectField, AsyncFetchListValuesFn, SelectFieldSettings, NumberFieldSettings,
  FieldProps, ConfigContext, VanillaWidgets,
} from "@react-awesome-query-builder/ui";
import sinon from "sinon";
import omit from "lodash/omit";
import merge from "lodash/merge";
const { VanillaFieldSelect } = VanillaWidgets;

export const SliderMark: React.FC<{ pct: number }> = ({ pct }) => {
  return <strong><span key="val">{pct}</span><span key="pct">%</span></strong>;
};
const SliderMark_NotExists: React.FC<{ pct: number }> = () => null;
const MyLabel: React.FC = () => null;

const fields: Fields = {
  num: {
    label: "Number",
    type: "number",
    preferWidgets: ["number"],
    fieldSettings: {
      min: 0,
      max: 10,
    },
  },
  str: {
    label: "String",
    type: "text",
  },
  color: {
    label: "Color",
    type: "select",
    fieldSettings: {
      listValues: [
        { value: "yellow", title: "Yellow" },
        { value: "green", title: "Green" },
        { value: "orange", title: "Orange" },
      ],
    }
  },
  autocomplete: {
    type: "select",
    fieldSettings: {
      useAsyncSearch: true,
      useLoadMore: true,
      forceAsyncSearch: false,
      allowCustomValues: false,
      asyncFetch: "autocompleteFetch",
    } as SelectFieldSettings,
  },
  autocomplete2: {
    type: "select",
    fieldSettings: {
      useAsyncSearch: true,
      asyncFetch: { CALL: [ {var: "ctx.autocompleteFetch"}, null, {var: "search"}, {var: "offset"} ] },
    } as SelectFieldSettings,
  },
  autocomplete3: {
    type: "select",
    fieldSettings: {
      useAsyncSearch: true,
      asyncFetch: "autocompleteFetch__does_not_exist",
    } as SelectFieldSettings,
  },
  slider: {
    type: "number",
    preferWidgets: ["slider", "rangeslider"],
    fieldSettings: {
      min: 0,
      max: 100,
      step: 1,
      marks: {
        0: <SliderMark pct={0} />,
        50: <strong><span key={"val"}>{50}</span><span key={"pct"}>%</span></strong>,
        100: <SliderMark pct={100} />,
      },
    } as NumberFieldSettings,
  },
  slider2: {
    type: "number",
    preferWidgets: ["slider", "rangeslider"],
    fieldSettings: {
      min: 0,
      max: 100,
      step: 1,
      marks: {
        0: <SliderMark_NotExists pct={0} />,
        50: <strong><span key={"val"}>{50}</span><span key={"pct"}>%</span></strong>,
      },
    } as NumberFieldSettings,
  },
  in_stock: {
    type: "boolean",
    mainWidgetProps: {
      labelYes: <MyLabel>Yes</MyLabel>,
      labelNo: "No",
    }
  },
};

const operators: Record<string, Partial<Operator>> = {
  between: {
    // not changed
    valueLabels: [
      "Value from",
      "Value to"
    ],
    // modify
    textSeparators: [
      <strong key="from">from</strong>,
      <strong key="to">to</strong>,
    ],
    // modify, change type from primitive to object
    jsonLogic: { aaa: 1 },
    // delete
    labelForFormat: undefined,
  },
};

const types: Record<string, Partial<Type>> = {
  boolean: {
    widgets: {
      boolean: {
        widgetProps: {
          // add
          hideOperator: true,
          operatorInlineLabel: "is",
          valueLabels: []
        },
        // modify, change type from object to primitive
        opProps: 111 as any
      },
    },
  }
};

// tip: LINEAR_REGRESSION and LOWER are heavily modified for tests, don't use in query value
const funcs: Funcs = {
  numeric: {
    type: "!struct",
    label: "Numeric",
    subfields: {
      LINEAR_REGRESSION: omit({
        ...BasicFuncs.LINEAR_REGRESSION,
        sqlFormatFunc: null, // modify
        myFormat: null, // add
        renderSeps: ["*"], // modify
        args: omit({
          ...(BasicFuncs.LINEAR_REGRESSION as Func).args,
          // modify
          coef: omit({
            ...(BasicFuncs.LINEAR_REGRESSION as Func).args.coef,
            newKey: "new_arg", // add
            defaultValue: 10, // override
            // omit label
          }, ["label"]),
          // add
          newArg: {
            type: "string",
            label: "New arg"
          },
          // omit bias
        }, "bias"),
        // omit spel*
      }, ["spelFormatFunc", "spelFunc"]) as Func,
    }
  },
  LOWER: omit({
    ...BasicFuncs.LOWER,
    label: undefined, // modify, delete
    mongoFunc: { lower: 12 }, // modify, change type from primitive to obj
    myFormat: 123, // add
    jsonLogicCustomOps: 1, // modify, change type from obj to primitive
    jsonLogic: "ToLowerCase", // modify
    // omit spel*
  }, ["spelFormatFunc", "spelFunc"]) as Func,
};

const settings: Partial<Settings> = {
  renderField: "myRenderField",
  renderButton: "button", // missing in ctx, so will try to render <button>
  renderOperator: { JSX: ["VanillaFieldSelect", {var: "props"}] },
  renderConfirm: { CALL: [ {var: "ctx.W.vanillaConfirm"}, null, {var: "props"} ] },
  renderConjs: { "if": [ { var: "props.someFlag" }, "VanillaConjs", "VanillaConjs" ] }
};

export const makeCtx = (BaseConfig: Config) => {
  return {
    ...BaseConfig.ctx,
    autocompleteFetch: sinon.spy(),
    myRenderField: (props: FieldProps, _ctx: ConfigContext) => {
      return <VanillaFieldSelect {...props}/>;
    },
    components: {
      SliderMark,
      MyLabel,
      // SliderMark_NotExists,
    }
  }
};

const withSlider = {
  "and": [
    {
      "==": [ { "var": "slider" },  33 ]
    },
    {
      "==": [ { "var": "slider2" },  44 ]
    }
  ]
};

export const zipInits = {
  withSlider,
};

export const configMixin = (BasicConfig: Config): Config => {
  const c = {
    ...BasicConfig,
    fields,
    operators: merge({}, BasicConfig.operators, operators),
    funcs: merge({}, BasicConfig.funcs, funcs),
    types: merge({}, BasicConfig.types, types),
    settings: {
      ...BasicConfig.settings,
      ...settings,
      useConfigCompress: true
    },
  };
  c.operators.between.labelForFormat = undefined; // manually set to undefined, cause of issue with merge()
  return c;
};


export const expectedZipConfig = {
  funcs: {
    "numeric": {
      "type": "!struct",
      "label": "Numeric",
      "subfields": {
        "LINEAR_REGRESSION": {
          "sqlFormatFunc": null,
          "renderSeps": ["*"],
          "args": {
            "coef": {
              "defaultValue": 10,
              "newKey": "new_arg",
              "label": "$$deleted",
            },
            "newArg": {
              "type": "string",
              "label": "New arg"
            },
            "bias": "$$deleted"
          },
          "myFormat": null,
          "$$key": "LINEAR_REGRESSION",
          "spelFormatFunc": "$$deleted"
        }
      }
    },
    "LOWER": {
      "label": "$$deleted",
      "mongoFunc": { "lower": 12 },
      "jsonLogic": "ToLowerCase",
      "jsonLogicCustomOps": 1,
      "myFormat": 123,
      "$$key": "LOWER",
      "spelFunc": "$$deleted"
    }
  },
  operators: {
    "between": {
      "textSeparators": [
        {
          "type": "strong",
          "props": {
            "children": "from"
          }
        },
        {
          "type": "strong",
          "props": {
            "children": "to"
          }
        }
      ],
      "jsonLogic": { "aaa": 1 },
      "labelForFormat": "$$deleted"
    }
  },
  types: {
    "boolean": {
      "widgets": {
        "boolean": {
          "widgetProps": {
            "hideOperator": true,
            "operatorInlineLabel": "is",
            "valueLabels": []
          },
          "opProps": 111
        }
      }
    }
  },
};