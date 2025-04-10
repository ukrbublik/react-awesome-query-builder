import React from "react";
import {
  MuiConfig, MuiWidgets, AsyncFetchListValuesResult, ConfigContext, FieldProps
} from "@react-awesome-query-builder/mui";
import merge from "lodash/merge";
import { ukUA } from "@mui/material/locale";
//import { ukUA } from "@mui/x-date-pickers/locales"; // todo: throws "TypeError: date.clone is not a function"
const { MuiFieldAutocomplete, MuiFieldSelect } = MuiWidgets;

// Config context for `DemoQueryBuilder` component

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

export default merge(
  {}, 
  MuiConfig.ctx, 
  {
    validateFirstName: (val: string) => {
      return (val.length < 10);
    },
    autocompleteFetch,
    myRenderField: (props: FieldProps, _ctx: ConfigContext) => {
      if (props?.customProps?.["showSearch"]) {
        return <MuiFieldAutocomplete {...props}/>;
      } else {
        return <MuiFieldSelect {...props}/>;
      }
    },
    ukUA,
    components: {
      SliderMark
    }
  }
);

