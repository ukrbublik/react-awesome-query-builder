import React, { useEffect } from "react";
import { LazyStyleModule } from "./utils";
// @ts-ignore
import styles from "@react-awesome-query-builder/ui/css/styles.scss";

const ImportMui: React.FC = () => {
  useEffect(() => {
    (styles as LazyStyleModule).use();
    return () => {
      (styles as LazyStyleModule).unuse();
    };
  }, []);
  return null;
};

export default ImportMui;
