import React from "react";

// value widgets
import DateWidget from "./value/Date";
import DateTimeWidget from "./value/DateTime";
import TimeWidget from "./value/Time";
import SelectWidget from "./value/Select";
import TextWidget from "./value/Text";
import TextAreaWidget from "./value/TextArea";
import NumberWidget from "./value/Number";
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
  const darkMode = config.settings.themeMode === "dark";
  const compactMode = config.settings.compactMode;
  const ref = React.createRef();
  const algorithms = [
    darkMode && theme.darkAlgorithm,
    compactMode && theme.compactAlgorithm,
    !compactMode && !darkMode && theme.defaultAlgorithm,
  ].filter(a => !!a);
  const palette = algorithms.reduce((tkns, algo, i) => i === 0 ? algo(tkns) : algo({}, tkns), theme.defaultSeed);
  React.useEffect(() => {
    const cssVarsTarget = ref.current;
    const cssVars = themeToCssVars(palette, darkMode);
    for (const k in cssVars) {
      if (cssVars[k] != undefined) {
        cssVarsTarget.style.setProperty(k, cssVars[k]);
      }
    }
    return () => {
      for (const k in cssVars) {
        cssVarsTarget.style.removeProperty(k);
      }
    };
  }, [darkMode, compactMode]);

  const base = (<div ref={ref} className={`qb-antd ${compactMode ? "qb-compact" : ""}`}>{children}</div>);
  const withProviders = (
    <ConfigProvider
      locale={config.settings.locale.antd}
      theme={{
        // https://ant.design/docs/react/customize-theme
        // todo: allow overrides
        algorithm: algorithms
      }}
    >{base}</ConfigProvider>
  );

  return withProviders;
};

const themeToCssVars = (palette, darkMode) => {
  // console.log('antd palette', palette);
  return {
    "--rule-background": palette.colorBgElevated,
    "--group-background": darkMode ? palette.colorBgMask : palette.colorFillQuaternary,
    "--rulegroup-background": darkMode ? palette.colorBgSpotlight : palette.colorSecondaryBg,
    "--rulegroupext-background": darkMode ? palette.colorBgSpotlight : palette.colorSecondaryBg,
    "--switch-background": darkMode ? palette.colorBgMask : palette.colorFillQuaternary,
    "--case-background": darkMode ? palette.colorBgMask : palette.colorFillQuaternary,

    "--rule-border-color": palette.colorBorderSecondary,
    "--group-border-color": palette.colorBorder,
    "--rulegroup-border-color": palette.colorBorder,
    "--rulegroupext-border-color": palette.colorBorder,
    "--switch-border-color": palette.colorBorderSecondary,
    "--case-border-color": palette.colorBorder,

    "--treeline-color": darkMode ? palette.colorPrimaryHover : palette.colorPrimaryHover,
    "--treeline-switch-color": darkMode ? palette.colorInfo : palette.colorInfo,
    '--treeline-disabled-color': palette.colorFillSecondary,

    "--main-text-color": palette.colorText,
    "--main-font-family": palette.fontFamily,
    "--main-font-size": palette.fontSize + "px",
    "--item-radius": palette.borderRadius + "px",

    "--rule-border-left-hover": "2px",
    "--group-border-left-hover": "2px",
    "--rulegroup-border-left-hover": "2px",
    "--rulegroupext-border-left-hover": "2px",
  };
};

export default {
  DateWidget,
  DateTimeWidget,
  TimeWidget,
  SelectWidget,
  TextWidget,
  TextAreaWidget,
  NumberWidget,
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
  themeToCssVars,
};