import React from "react";

import { skinToImport } from "./lazyStyles";
import { skinToConfig } from "./configs";
import type { LazyStyleModule } from "./lazyStyles/utils";

const ImportSkinStyles: React.FC<{skin: string}> = ({
  skin
}) => {
  const SkinImport = skinToImport[skin];
  return <React.Suspense fallback={<>loading styles for {skin}</>}><SkinImport /></React.Suspense>;
};

export {
  ImportSkinStyles,
  skinToConfig,
  type LazyStyleModule,
};
