import React, { useEffect } from "react";
import { LazyStyleModule } from "./utils";
// @ts-ignore
import styles from "@react-awesome-query-builder/bootstrap/css/styles.scss";
// @ts-ignore
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

const ImportMui: React.FC = () => {
  useEffect(() => {
    (bootstrap as LazyStyleModule).use();
    (styles as LazyStyleModule).use();
    return () => {
      (styles as LazyStyleModule).unuse();
      (bootstrap as LazyStyleModule).unuse();
    };
  }, []);
  return null;
};

export default ImportMui;
