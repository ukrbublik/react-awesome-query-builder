import {
  ImmutableTree, Config, Actions
} from "@react-awesome-query-builder/ui";


export interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
  skin: string;
  renderBocks: Record<string, boolean>;
  spelStr: string;
  spelErrors: Array<string>;
  initFile: string;
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
