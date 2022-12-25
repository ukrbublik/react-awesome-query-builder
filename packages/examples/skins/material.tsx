import React, { useEffect } from "react";
import styles from "@react-awesome-query-builder/material/css/styles.scss";

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
