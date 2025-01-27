import {
  ImmutableTree, Config, Actions, PartialPartial
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
  initFile: string;
  themeMode: "light" | "dark";
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
  }

  interface Console {
    profile: (profileName?: string) => void;
    profileEnd: (profileName?: string) => void;
  }
}
