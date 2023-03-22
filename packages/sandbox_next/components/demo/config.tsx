import React from "react";
import { createConfig } from "../../lib/config";
import {
  MuiConfig, MuiWidgets, Config, FieldOrGroup, AsyncFetchListValuesResult, Utils, Operator, Type, Settings, Widget, ConfigMixin, CoreConfig, ConfigContext
} from "@react-awesome-query-builder/mui";
import merge from "lodash/merge";
import { ukUA } from "@mui/material/locale";
import { green, purple } from "@mui/material/colors";
//import { ukUA } from "@mui/x-date-pickers/locales"; // todo: throws "TypeError: date.clone is not a function"
//import "moment/locale/ru";
const { MuiFieldAutocomplete, MuiFieldSelect } = MuiWidgets;

// UI mixins for created config - add asyncFetch, custom React components, overrides
//   ! Important !
//   Don't add JS functions to config, since it can't be used by SSR.
//   Use JsonLogic functions instead, see `factory`.
//   Or add functions to `ctx` and reference them with name in other sections of config (see `autocompleteFetch` or `myRenderField`)
//   Add custom React components (like `SliderMark`) to `ctx.components`

const autocompleteFetch = async (search: string | null, offset: number): Promise<AsyncFetchListValuesResult> => {
  const response = await fetch("/api/autocomplete?" + new URLSearchParams({
    search: search || "",
    offset: offset ? String(offset) : "",
  }).toString());
  const result = await response.json() as AsyncFetchListValuesResult;
  return result;
};

const SliderMark: React.FC<{ pct: number }> = ({ pct }) => {
  return <strong><span>{pct}</span><span>%</span></strong>;
};

const fieldsMixin: Record<string, Partial<FieldOrGroup>> = {
  slider: {
    fieldSettings: {
      marks: {
        0: <SliderMark pct={0} />,
        50: <strong><span>{50}</span><span>%</span></strong>,
        100: <SliderMark pct={100} />,
      },
    },
  },
  autocomplete: {
    fieldSettings: {
      asyncFetch: "autocompleteFetch",
      // same as:
      // asyncFetch: { CALL: [ {var: "ctx.autocompleteFetch"}, null, {var: "search"}, {var: "offset"} ] },
    },
  },
  autocompleteMultiple: {
    fieldSettings: {
      asyncFetch: "autocompleteFetch",
    },
  },
};

const widgetsMixin: Record<string, Partial<Widget>> = {
  multiselect: {
    factory: {
      if: [
        { or: [ { var: "props.asyncFetch" }, { var: "props.showSearch" } ] },
        { REACT: ["MuiAutocompleteWidget", { mergeObjects: [
          { var: "props" },
          { fromEntries: [ [ [ "multiple", true ] ] ] }
        ]}] },
        { REACT: ["MuiMultiSelectWidget", {var: "props"}] }
      ]
    }
  },
  select: {
    factory: {
      if: [
        { or: [ { var: "props.asyncFetch" }, { var: "props.showSearch" } ] },
        { REACT: ["MuiAutocompleteWidget", {var: "props"}] },
        { REACT: ["MuiSelectWidget", {var: "props"}] }
      ]
    }
  },
};

const operatorsMixin: Record<string, Partial<Operator>> = {
  between: {
    valueLabels: [
      "Value from",
      "Value to"
    ],
    textSeparators: [
      <strong>from</strong>,
      <strong>to</strong>,
    ],
  },
};

const typesMixin: Record<string, Partial<Type>> = {
  number: {
    widgets: {
      number: {
        widgetProps: {
          factory: "VanillaNumberWidget",
        }
      }
    }
  }
};


export const ctx = merge(
  {}, 
  MuiConfig.ctx, 
  {
    autocompleteFetch,
    myRenderField: (props: any, _ctx: ConfigContext) => {
      if (props?.customProps?.showSearch) {
        return <MuiFieldAutocomplete {...props}/>
      } else {
        return <MuiFieldSelect {...props}/>
      }
    },
    ukUA,
    components: {
      SliderMark
    }
  }
);

const renderSettings: Partial<Settings> = {
  renderField: "myRenderField",
  // renderField: {
  //   if: [
  //     { var: "props.customProps.showSearch" },
  //     { REACT: ["MuiFieldAutocomplete", {var: "props"}] },
  //     { REACT: ["MuiFieldSelect", {var: "props"}] },
  //   ]
  // }, 
  renderConfirm: "W.MuiConfirm", // { CALL: [ {var: "ctx.W.MuiConfirm"}, null, {var: "props"} ] },
  useConfirm: "W.MuiUseConfirm", // { CALL: [ {var: "ctx.W.MuiUseConfirm"} ] },
};

const configMixin: ConfigMixin = {
  ctx,
  fields: fieldsMixin,

  widgets: widgetsMixin,
  operators: operatorsMixin,
  types: typesMixin,
  settings: {
    ...renderSettings,
    locale: {
      mui: { var: "ctx.ukUA" },
    },
  }
};

function randomColor() {
  let hex = Math.floor(Math.random() * 0xFFFFFF);
  let color = "#" + hex.toString(16);
  return color;
}

export const mixinConfig = (baseConfig: Config, customMixin?: ConfigMixin) => {
  return merge(
    {},
    baseConfig,
    configMixin,
    customMixin || {}
  ) as Config;
};

export const generateNewConfig = (baseConfig: CoreConfig) => {
  return mixinConfig(
    createConfig(baseConfig),
    {
      settings: {
        theme: {
          mui: {
            palette: {
              primary: { main: randomColor() },
              secondary: { main: randomColor() },
            },
          }
        }
      }
  }
  );
};

