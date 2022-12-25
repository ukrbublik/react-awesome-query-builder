import React, { useEffect } from "react";
import styles from "@react-awesome-query-builder/mui/css/styles.scss";

const ImportMui: React.FC = () => {
  useEffect(() => {
    styles.use();
    return () => {
      styles.unuse();
    };
  }, []);
  return null;
};

export default ImportMui;
