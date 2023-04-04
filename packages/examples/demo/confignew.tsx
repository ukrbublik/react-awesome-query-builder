
  import {
    Utils, 
    //types:
    ImmutableTree, Config, JsonTree, JsonGroup, JsonLogicTree, ActionMeta, Actions
  } from "@react-awesome-query-builder/core";
  import {
    Query, Builder, 
    //types:
    BuilderProps, MuiConfig, Widget, Types, Settings, Optional, Fields
  } from "@react-awesome-query-builder/mui";

  import { getFilterOptions, mapFiltersFieldsConfig } from "./utils";
  import {
    FieldNameEnum,
    FilterFieldConfig,
    FilterGroupEnum,
    FilterTypeEnum,
  } from "./types";
  import { theme } from "./theme";
  
  const InitialConfig = MuiConfig;
  
  export const filterFieldsConfig: FilterFieldConfig[] = [
    {
      type: FilterTypeEnum.Multiselect,
      valueSources: ["value"],
      fieldSettings: {
        useAsyncSearch: true,
        useLoadMore: true,
        forceAsyncSearch: false,
        allowCustomValues: false,
      },
    },
    {
      type: FilterTypeEnum.Boolean,
      operators: ["equal"],
      valueSources: ["value"],
      mainWidgetProps: {
        labelYes: "+",
        labelNo: "–",
      },
    },
    {
      type: FilterTypeEnum.Number,
      valueSources: ["value"],
      preferWidgets: ["slider", "rangeslider"],
    },
  ];
  
  const settings: Settings = {
    ...InitialConfig.settings,
    theme: {
      mui: theme,
    },
    maxNesting: 1,
  };
  
  const types: Types = {
    ...InitialConfig.types,
    text: {
      ...InitialConfig.types.text,
      excludeOperators: ["proximity"],
    },
    boolean: {
      ...InitialConfig.types.boolean,
      widgets: {
        ...InitialConfig.types.boolean.widgets,
        boolean: {
          ...InitialConfig.types.boolean.widgets.boolean,
          widgetProps: {
            hideOperator: true,
            // operatorInlineLabel type not recognized in v5.3.1
            operatorInlineLabel: "is",
          } as Optional<Widget>,
        },
      },
    },
  };
  
  const potentialFilters = [
    {
      fieldName: FieldNameEnum.FieldA,
      label: "Boolean",
      type: FilterTypeEnum.Boolean,
      group: FilterGroupEnum.GroupA,
    },
    {
      fieldName: FieldNameEnum.FieldB,
      label: "Multiselect",
      type: FilterTypeEnum.Multiselect,
      group: FilterGroupEnum.GroupB,
    },
    {
      fieldName: FieldNameEnum.FieldC,
      label: "Number",
      type: FilterTypeEnum.Number,
      group: FilterGroupEnum.GroupC,
      min: 0,
      max: 2000000,
    },
  ];
  
  const fields: Fields = mapFiltersFieldsConfig(
    potentialFilters,
    filterFieldsConfig,
    getFilterOptions
  );
  
  export const queryBuilderConfig: Config = {
    ...InitialConfig,
    settings,
    types,
    fields,
  };
  