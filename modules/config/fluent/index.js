import FluentWidgets from "../../components/widgets/fluent";
import BasicConfig from "../basic";
import React from "react";

const {
  FluentText,
} = FluentWidgets;

const settings = {
  ...BasicConfig.settings,
};

const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props) => <FluentText {...props} />,
  },
};


const types = {
  ...BasicConfig.types,
};

export default {
  ...BasicConfig,
  types,
  widgets,
  settings,
};