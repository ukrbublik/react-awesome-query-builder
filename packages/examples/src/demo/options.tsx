import {
  SanitizeOptions
} from "@react-awesome-query-builder/ui";
import { DemoQueryBuilderState } from "./types";

export const defaultInitFile = "sql/simple";
export const initialSkin = "mui";

export const validationTranslateOptions: Partial<SanitizeOptions> = {
  translateErrors: true,
  includeStringifiedItems: true,
  includeItemsPositions: true,
};

export const defaultRenderBlocks: DemoQueryBuilderState["renderBocks"] = {
  validation: false,
  jsonlogic: false,
  elasticSearch: false,
  mongo: false,
  jsTree: true,
  spel: false,
  strings: true,
  sql: true,
  actions: false,
  withProfile: false,
  queryBuilder: false,
};
