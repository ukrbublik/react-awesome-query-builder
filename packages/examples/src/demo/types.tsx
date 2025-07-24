import {
  ImmutableTree, Config, Actions, PartialPartial, ThemeMode, RenderSize,
} from "@react-awesome-query-builder/ui";


export interface DemoQueryBuilderState {
  tree: ImmutableTree;
  initErrors: Array<string>;
  config: Config;
  skin: string;
  renderBocks: Record<string, boolean>;
  spelStr: string;
  sqlStr: string;
  spelErrors: Array<string>;
  sqlErrors: Array<string>;
  sqlWarnings: Array<string>;
  jsonLogicStr: string;
  jsonLogicErrors: Array<string>;
  isJsonEditorOpen: boolean;
  initFile: string;
  themeMode: ThemeMode | "auto";
  isBodyDark: boolean;
  useOldDesign: boolean;
  renderSize: RenderSize;
  compactMode: boolean;
  liteMode: boolean;
  configChanges: PartialPartial<Config>;
}

export interface DemoQueryBuilderMemo {
  immutableTree?: ImmutableTree;
  config?: Config;
  actions?: Actions;
}

declare global {
  interface Window {
    _initialSkin: string;
    _initFile: string;
    _configChanges: Record<string, any>;
  }

  interface Console {
    profile: (profileName?: string) => void;
    profileEnd: (profileName?: string) => void;
  }
}
