import { FieldOrGroup, FieldSettings } from "@react-awesome-query-builder/ui";

export enum FieldNameEnum {
  FieldA = "FieldA",
  FieldB = "FieldB",
  FieldC = "FieldC",
}

export enum FilterGroupEnum {
  GroupA = "GroupA",
  GroupB = "GroupB",
  GroupC = "GroupC",
}

export enum FilterTypeEnum {
  Multiselect = "multiselect",
  Boolean = "boolean",
  Number = "number",
}

export interface FilterDto {
  fieldName: FieldNameEnum;
  type: FilterTypeEnum;
  group: FilterGroupEnum;
  label: string;
  min?: number;
  max?: number;
}

export interface GetFilterOptions {
  searchInput?: string;
  offset?: number;
  fieldName?: FieldNameEnum;
}

export interface OptionDto {
  value: string;
  title?: string;
}

export interface FilterOptionDto {
  fieldName: FieldNameEnum;
  hasMore: boolean;
  options: OptionDto[];
}

export type FilterFieldConfig = FieldOrGroup & {
  fieldSettings?: FieldSettings;
};
