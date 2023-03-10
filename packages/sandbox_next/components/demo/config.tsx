import React from "react";
import { createConfig } from "../../lib/config";
import {
  MuiConfig, Config, FieldOrGroup, AsyncFetchListValuesResult, Utils, Operator, Type, Settings, Widget, ConfigMixin
} from "@react-awesome-query-builder/mui";
import merge from "lodash/merge";
import { ukUA } from "@mui/material/locale";
import { green, purple } from '@mui/material/colors';
//import { ukUA } from "@mui/x-date-pickers/locales"; // todo: throws "TypeError: date.clone is not a function"
//import "moment/locale/ru";

const autocompleteFetch = async (search: string | null, offset: number): Promise<AsyncFetchListValuesResult> => {
  const response = await fetch("/api/autocomplete?" + new URLSearchParams({
    search: search || "",
    offset: offset && String(offset) || null
  }).toString());
  const result = await response.json() as AsyncFetchListValuesResult;
  return result;
};

function randomColor() {
  let hex = Math.floor(Math.random() * 0xFFFFFF);
  let color = "#" + hex.toString(16);
  return color;
}

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
        { RE: ["MuiAutocompleteWidget", { MERGE: [
          { var: "props" },
          { MAP: [ [ [ "multiple", true ] ] ] }
        ]}] },
        { RE: ["MuiMultiSelectWidget", {var: "props"}] }
      ]
    }
  },
  select: {
    factory: {
      if: [
        { or: [ { var: "props.asyncFetch" }, { var: "props.showSearch" } ] },
        { RE: ["MuiAutocompleteWidget", {var: "props"}] },
        { RE: ["MuiSelectWidget", {var: "props"}] }
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

export const ctx = merge({}, MuiConfig.ctx, {
  autocompleteFetch,
  ukUA,
  components: {
    SliderMark
  }
});

const renderSettings: Partial<Settings> = {
  renderField: {
    if: [
      { var: "props.customProps.showSearch" },
      { RE: ["MuiFieldAutocomplete", {var: "props"}] },
      { RE: ["MuiFieldSelect", {var: "props"}] },
    ]
  }, 
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

export const generateConfig = () => {
  return mixinConfig({
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
  });
};

export const mixinConfig = (customMixin: ConfigMixin) => {
  return merge(
    {},
    createConfig(MuiConfig),
    configMixin,
    customMixin
  ) as Config;
};

export default mixinConfig({});
