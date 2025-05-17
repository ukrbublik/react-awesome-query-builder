import React from "react";
import merge from "lodash/merge";
import {
  Config, Settings, 
  AntdConfig, AntdWidgets,
} from "@react-awesome-query-builder/antd";
import { createConfig } from "./config";
import ru_RU from "antd/es/locale/ru_RU";
//import "antd/dist/antd.css"; // for v4
import "@react-awesome-query-builder/antd/css/styles.scss";

const {
  FieldSelect,
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
} = AntdWidgets;

const configMixin = {
  settings: {
    locale: {
      antd: ru_RU
    },
    // renderField: (props) => <FieldCascader {...props} />,
    // renderOperator: (props) => <FieldDropdown {...props} />,
    // renderFunc: (props) => <FieldSelect {...props} />,
  } as Partial<Settings>
};

const config: Config = merge( {}, createConfig(AntdConfig), configMixin );

export default config;
