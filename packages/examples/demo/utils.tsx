
import {
    //types:
    FieldGroup, Fields
  } from "@react-awesome-query-builder/mui";

import {
  FieldNameEnum,
  FilterDto,
  FilterFieldConfig,
  FilterOptionDto,
  FilterTypeEnum,
  GetFilterOptions,
} from "./types";

export const getFilterOptions = async (getFilterOptions: GetFilterOptions) => {
  return {
    fieldName: FieldNameEnum.FieldB,
    hasMore: false,
    options: [
      {
        value: "1",
        title: "OptionA",
      },
      {
        value: "2",
        title: "OptionB",
      },
      {
        value: "3",
        title: "OptionC",
      },
    ],
  };
};

export const mapFiltersFieldsConfig = (
  filters: FilterDto[],
  filterFieldsConfig: FilterFieldConfig[],
  asyncFilterFetch: (params: GetFilterOptions) => Promise<FilterOptionDto>
) =>
  filters.reduce<Fields>((prev, curr) => {
    const fieldConfig = filterFieldsConfig.find(
      (field) => field.type === curr.type
    )!;

    const newField = {
      [curr.fieldName]: {
        ...fieldConfig,
        label: curr.label,
        fieldSettings: {
          ...fieldConfig.fieldSettings,
          min: curr.type === FilterTypeEnum.Number ? curr.min : undefined,
          max: curr.type === FilterTypeEnum.Number ? curr.max : undefined,
          asyncFetch: async (search: string | null, offset: number) => {
            console.log(2222)
            const { options, hasMore } = await asyncFilterFetch({
              fieldName: curr.fieldName,
              searchInput: search ?? "",
              offset,
            });
            return {
              values: options.map(({ value }) => ({ value, title: value })),
              hasMore,
            };
          },
        },
      },
    };

    if (curr.group) {
      return {
        ...prev,
        [curr.group]: {
          label: curr.group,
          type: "!struct",
          subfields: {
            ...(prev[curr.group] as FieldGroup)?.subfields,
            ...newField,
          },
        },
      };
    }

    return { ...prev, ...newField };
  }, {});
