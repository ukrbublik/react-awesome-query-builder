import React from "react";
import type {
  Config, FieldOrGroup, Operator, Settings, Widget, ConfigMixin
} from "@react-awesome-query-builder/ui";
import merge from "lodash/merge";
import pureServerConfig from "./config_base";

// Adds UI mixins to config created in `./config` - adds asyncFetch, custom React components, factory overrides.
// Exported config is used on server-side to generate initial compressed config.
// On browser can be decompressed to a full-featured config with a proper `ctx`.
// `ctx` should contain used funcs (like `autocompleteFetch`), React components (like `SliderMark`) - see `components/demo/config_ctx`
//
//   ! Important !
//   Don't add JS functions to config, since it can't be used with SSR.
//   Use JsonLogic functions instead, see `factory`.
//   Or add functions to `ctx` and reference them with name in other sections of config (see `autocompleteFetch` or `myRenderField`)
//   Add custom React components (like `SliderMark`) to `ctx.components`


// It's dummy implementation
// Just to show how you can include JSX in config and it will be serialized correctly with ConfigUtils.compressConfig()
// Real implementation in `components/demo/config_ctx`
const SliderMark: React.FC<{ pct: number }> = () => null;

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
      // Real implementation of `autocompleteFetch` should be in `ctx`
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

// Demostrates how you can use JsonLogic function to customize `factory` with some logic
const widgetsMixin: Record<string, Partial<Widget>> = {
  multiselect: {
    factory: {
      if: [
        { or: [ { var: "props.asyncFetch" }, { var: "props.showSearch" } ] },
        { JSX: ["MuiAutocompleteWidget", { mergeObjects: [
          { var: "props" },
          { fromEntries: [ [ [ "multiple", true ] ] ] }
        ]}] },
        { JSX: ["MuiMultiSelectWidget", {var: "props"}] }
      ]
    }
  },
  select: {
    factory: {
      if: [
        { or: [ { var: "props.asyncFetch" }, { var: "props.showSearch" } ] },
        { JSX: ["MuiAutocompleteWidget", {var: "props"}] },
        { JSX: ["MuiSelectWidget", {var: "props"}] }
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
      <strong key="from">from</strong>,
      <strong key="to">to</strong>,
    ],
  },
};

const renderSettings: Partial<Settings> = {
  renderField: "myRenderField",
  renderConfirm: "W.MuiConfirm", // or  { CALL: [ {var: "ctx.W.MuiConfirm"}, null, {var: "props"} ] },
  useConfirm: "W.MuiUseConfirm", // or  { CALL: [ {var: "ctx.W.MuiUseConfirm"} ] },
};


const configMixin: ConfigMixin = {
  fields: fieldsMixin,
  widgets: widgetsMixin,
  operators: operatorsMixin,
  settings: {
    ...renderSettings,
    locale: {
      mui: { var: "ctx.ukUA" },
    },
  }
};


const mixinConfig = (baseConfig: Config) => {
  return merge(
    {},
    baseConfig,
    configMixin,
  ) as Config;
};

export default mixinConfig(pureServerConfig);
