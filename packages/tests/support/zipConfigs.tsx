import React from "react";
import {
  Config, Fields, Funcs, BasicFuncs, Func,
  SelectField, AsyncFetchListValuesFn, SelectFieldSettings, NumberFieldSettings,
} from "@react-awesome-query-builder/ui";
import sinon from "sinon";
import omit from "lodash/omit";

export const SliderMark: React.FC<{ pct: number }> = ({ pct }) => {
  return <strong><span key="val">{pct}</span><span key="pct">%</span></strong>;
};
const SliderMark_NotExists: React.FC<{ pct: number }> = () => null;

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
};

const funcs: Funcs = {
  numeric: {
    type: "!struct",
    label: "Numeric",
    subfields: {
      LINEAR_REGRESSION: omit({
        ...BasicFuncs.LINEAR_REGRESSION,
        sqlFormatFunc: null, // modify
        myFormat: null, // add
        args: omit({
          ...(BasicFuncs.LINEAR_REGRESSION as Func).args,
          // modify
          coef: {
            ...(BasicFuncs.LINEAR_REGRESSION as Func).args.coef,
            newKey: "new_arg", // add
            defaultValue: 10, // override
          },
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
    sqlFormatFunc: null, // modify
    myFormat: null, // add
    // omit spel*
  }, ["spelFormatFunc", "spelFunc"]) as Func,
};

export const makeCtx = (BaseConfig: Config) => {
  return {
    ...BaseConfig.ctx,
    autocompleteFetch: sinon.spy(),
    components: {
      SliderMark,
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

export const configMixin = {
  fields,
  funcs,
  settings: {
    useConfigCompress: true
  }
};
