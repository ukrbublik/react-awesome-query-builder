import React from "react";

const ImportUi = React.lazy(() => import("./ui"));
const ImportAntd = React.lazy(() => import("./antd"));
const ImportMui = React.lazy(() => import("./mui"));
const ImportMaterial = React.lazy(() => import("./material"));
const ImportBootstrap = React.lazy(() => import("./bootstrap"));
const ImportFluent = React.lazy(() => import("./fluent"));

const skinToImport: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  vanilla: ImportUi,
  mui: ImportMui,
  antd: ImportAntd,
  material: ImportMaterial,
  bootstrap: ImportBootstrap,
  fluent: ImportFluent
};

const Import: React.FC<{skin: string}> = ({
  skin
}) => {
  const Import = skinToImport[skin];
  return <React.Suspense fallback={<>loading styles for {skin}</>}><Import /></React.Suspense>;
};

export default Import;
