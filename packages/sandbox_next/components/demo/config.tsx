import React from "react";
import { createConfig } from "../../lib/config";
import { MuiConfig, Config, FieldOrGroup, AsyncFetchListValuesResult, Utils } from "@react-awesome-query-builder/mui";
import merge from "lodash/merge";
import { ukUA } from "@mui/material/locale";

const autocompleteFetch = async (search: string | null, offset: number): Promise<AsyncFetchListValuesResult> => {
  const response = await fetch("/api/autocomplete?" + new URLSearchParams({
    search: search || "",
    offset: offset && String(offset) || null
  }).toString());
  const result = await response.json() as AsyncFetchListValuesResult;
  return result;
};

const fieldsMixin: Record<string, Partial<FieldOrGroup>> = {
  slider: {
    fieldSettings: {
      marks: {
        0: <strong>0%</strong>,
        100: <strong>100%</strong>,
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

export const ctx = merge({}, MuiConfig.ctx, {
  autocompleteFetch,
  ukUA,
});

const configMixin = {
  ctx,
  fields: fieldsMixin,
  settings: {
    locale: {
      mui: { var: "ctx.ukUA" }
    },
    theme: {
      mui: {
        palette: {
          primary: { main: '#03a9f4' },
        },
      }
    }
  }
};

const config: Config = merge( {}, createConfig(MuiConfig), configMixin );

export default config;
