import React from "react";
import {
  Config, BasicConfig,
} from "@react-awesome-query-builder/ui";

const ImportUi = React.lazy(() => import("./ui"));
const ImportAntd = React.lazy(() => import("./antd"));
const ImportMui = React.lazy(() => import("./mui"));
const ImportMaterial = React.lazy(() => import("./material"));
const ImportBootstrap = React.lazy(() => import("./bootstrap"));
const ImportFluent = React.lazy(() => import("./fluent"));

import { AntdConfig } from "@react-awesome-query-builder/antd";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import { MaterialConfig } from "@react-awesome-query-builder/material";
import { BootstrapConfig } from "@react-awesome-query-builder/bootstrap";
import { FluentUIConfig } from "@react-awesome-query-builder/fluent";

const skinToImport: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  vanilla: ImportUi,
  mui: ImportMui,
  antd: ImportAntd,
  material: ImportMaterial,
  bootstrap: ImportBootstrap,
  fluent: ImportFluent
};

export const skinToConfig: Record<string, Config> = {
  vanilla: BasicConfig,
  antd: AntdConfig,
  material: MaterialConfig,
  mui: MuiConfig,
  bootstrap: BootstrapConfig,
  fluent: FluentUIConfig
};

const ImportSkinStyles: React.FC<{skin: string}> = ({
  skin
}) => {
  const SkinImport = skinToImport[skin];
  return <React.Suspense fallback={<>loading styles for {skin}</>}><SkinImport /></React.Suspense>;
};

export default ImportSkinStyles;
