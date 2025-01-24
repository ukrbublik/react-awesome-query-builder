import React from "react";

// value widgets
import DateWidget from "./value/Date";
import DateTimeWidget from "./value/DateTime";
import TimeWidget from "./value/Time";
import SelectWidget from "./value/Select";
import TextWidget from "./value/Text";
import TextAreaWidget from "./value/TextArea";
import NumberWidget from "./value/Number";
import PriceWidget from "./value/Price";
import SliderWidget from "./value/Slider";
import RangeWidget from "./value/Range";
import BooleanWidget from "./value/Boolean";
import MultiSelectWidget from "./value/MultiSelect";
import AutocompleteWidget from "./value/Autocomplete";
import TreeSelectWidget from "./value/TreeSelect";

// field select widgets
import FieldSelect from "./core/FieldSelect";
import FieldDropdown from "./core/FieldDropdown";
import FieldCascader from "./core/FieldCascader";
import FieldTreeSelect from "./core/FieldTreeSelect";

// core components
import Icon from "./core/Icon";
import Button from "./core/Button";
import ButtonGroup from "./core/ButtonGroup";
import Conjs from "./core/Conjs";
import Switch from "./core/Switch";
import ValueSources from "./core/ValueSources";
import confirm from "./core/confirm";

import { ConfigProvider, theme } from "antd";
const Provider = ({ config, children }) => {
  const darkMode = config.settings.theme?.antd?.darkMode ?? false;
  const algorithm = darkMode ? theme.darkAlgorithm : theme.compactAlgorithm;
  const palette = algorithm(theme.defaultSeed);
  React.useEffect(() => {
    console.log('antd palette', palette);
    const r = document.querySelector(":root");
    const cssVars = {
      "--rule-background": palette.colorBgElevated,
      "--group-background": darkMode ? palette.colorBgMask : palette.colorFillSecondary,
      "--rulegroup-background": darkMode ? palette.colorBgSpotlight : palette.colorSecondaryBg,
      "--rulegroupext-background": darkMode ? palette.colorBgSpotlight : palette.colorSecondaryBg,
      "--rule-border-color": palette.colorBorder,
      "--group-border-color": palette.colorBorderSecondary,
      "--rulegroup-border-color": palette.colorBorderSecondary,
      "--rulegroupext-border-color": palette.colorBorderSecondary,
      "--treeline-color": darkMode ? palette.colorInfo : palette.colorInfoBorder,
      '--treeline-disabled-color': palette.colorFillSecondary,
      "--main-text-color": palette.colorText,
      "--main-font-family": palette.fontFamily,
      "--main-font-size": palette.fontSize,
      //"--group-in-rulegroupext-border-color": palette.colorBorderSecondary,
    };
    console.log('antd cssVars', cssVars);
    for (const k in cssVars) {
      if (cssVars[k] != undefined) {
        r.style.setProperty(k, cssVars[k]);
      }
    }
    return () => {
      for (const k in cssVars) {
        r.style.removeProperty(k);
      }
    };
  }, [darkMode]);
  return (
    <ConfigProvider
      locale={config.settings.locale.antd}
      theme={{
        algorithm
      }}
    >{children}</ConfigProvider>
  );
};

export default {
  DateWidget,
  DateTimeWidget,
  TimeWidget,
  SelectWidget,
  TextWidget,
  TextAreaWidget,
  NumberWidget,
  PriceWidget,
  SliderWidget,
  RangeWidget,
  BooleanWidget,
  MultiSelectWidget,
  AutocompleteWidget,
  TreeSelectWidget,

  FieldSelect,
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,

  Icon,
  Button,
  ButtonGroup,
  Conjs,
  Switch,
  ValueSources,
  confirm,

  Provider,
};