import React from "react";
import { createConfig } from "../../lib/config";
import { MuiConfig, Config, FieldOrGroup, Utils, AsyncFetchListValuesResult } from "@react-awesome-query-builder/mui";
import merge from "lodash/merge";
import { ruRU } from "@mui/material/locale";

const asyncFetch = async (search: string | null, offset: number): Promise<AsyncFetchListValuesResult> => {
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
        100: <strong>100%</strong>
      },
    },
  },
  autocomplete: {
    fieldSettings: {
      asyncFetch,
    },
  },
  autocompleteMultiple: {
    fieldSettings: {
      asyncFetch,
    },
  },
};

const configMixin = {
  fields: fieldsMixin,
  settings: {
    locale: {
      mui: ruRU
    }
  }
};

const config: Config = merge( createConfig(MuiConfig), configMixin );

export default config;
