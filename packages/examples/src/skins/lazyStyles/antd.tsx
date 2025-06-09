import React, { useEffect } from "react";
import { LazyStyleModule } from "./utils";
//TODO: can leave for v5 ?
// @ts-ignore
import antd from "antd/dist/antd.css"; // for v4
// @ts-ignore
import styles from "@react-awesome-query-builder/antd/css/styles.scss";

const ImportAntd: React.FC = () => {
  useEffect(() => {
    (antd as LazyStyleModule).use();
    (styles as LazyStyleModule).use();
    return () => {
      (styles as LazyStyleModule).unuse();
      (antd as LazyStyleModule).unuse();
    };
  }, []);
  return null;
};

export default ImportAntd;
