import {
  SanitizeOptions
} from "@react-awesome-query-builder/ui";
import { DemoQueryBuilderState } from "./types";

export const defaultInitFile = window._initFile || "tree/complex";
export const initialSkin = window._initialSkin || "mui";

export const validationTranslateOptions: Partial<SanitizeOptions> = {
  translateErrors: true,
  includeStringifiedItems: true,
  includeItemsPositions: true,
};

export const defaultRenderBlocks: DemoQueryBuilderState["renderBocks"] = {
  validation: true,
  jsonlogic: true,
  elasticSearch: true,
  mongo: true,
  jsTree: true,
  spel: true,
  strings: true,
  sql: true,
  actions: false,
  withProfile: false,
  queryBuilder: true,
};
