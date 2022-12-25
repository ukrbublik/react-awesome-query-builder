import React, { useEffect } from "react";
import antd from "antd/dist/antd.css"; // or import "@react-awesome-query-builder/antd/css/antd.less"
import styles from "@react-awesome-query-builder/antd/css/styles.scss";

const ImportAntd: React.FC = () => {
  useEffect(() => {
    antd.use();
    styles.use();
    return () => {
      styles.unuse();
      antd.unuse();
    };
  }, []);
  return null;
};

export default ImportAntd;
