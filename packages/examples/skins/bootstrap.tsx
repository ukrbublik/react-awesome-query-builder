import React, { useEffect } from "react";
import styles from "@react-awesome-query-builder/bootstrap/css/styles.scss";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

const ImportMui: React.FC = () => {
  useEffect(() => {
    bootstrap.use();
    styles.use();
    return () => {
      styles.unuse();
      bootstrap.unuse();
    };
  }, []);
  return null;
};

export default ImportMui;
