import React from "react";

import { initializeIcons } from "@fluentui/font-icons-mdl2";
import { ThemeProvider } from "@fluentui/react";
initializeIcons();

// value widgets
import FluentUITextWidget from "./value/FluentUIText";
import FluentUITextAreaWidget from "./value/FluentUITextArea";
import FluentUIDateWidget from "./value/FluentUIDate";
import FluentUIDateTimeWidget from "./value/FluentUIDateTime";
import FluentUITimeWidget from "./value/FluentUITime";
import FluentUISelectWidget from "./value/FluentUISelect";
import FluentUINumberWidget from "./value/FluentUINumber";
import FluentUIPriceWidget from "./value/FluentUIPrice";
import FluentUISliderWidget from "./value/FluentUISlider";
import FluentUIBooleanWidget from "./value/FluentUIBoolean";
import FluentUIMultiSelectWidget from "./value/FluentUIMultiSelect";

// field select widgets
import FluentUIFieldSelect from "./core/FluentUIFieldSelect";

// core components
import FluentUIIcon from "./core/FluentUIIcon";
import FluentUIButton from "./core/FluentUIButton";
import FluentUIButtonGroup from "./core/FluentUIButtonGroup";
import FluentUIConjs from "./core/FluentUIConjs";
import FluentUIValueSources from "./core/FluentUIValueSources";
import FluentUIConfirm from "./core/FluentUIConfirm";

// provider
const FluentUIProvider = ({config, children}) => {
  const themeMode = config.settings.themeMode ?? "light";
  const darkMode = config.settings.themeMode === "dark";
  const compactMode = config.settings.compactMode;

  // https://developer.microsoft.com/en-us/fluentui#/controls/web/themeprovider
  const darkTheme = {
    // https://github.com/microsoft/fluentui/issues/9795#issuecomment-511882323
    palette: {
      neutralLighterAlt: '#282828',
      neutralLighter: '#313131',
      neutralLight: '#3f3f3f',
      neutralQuaternaryAlt: '#484848',
      neutralQuaternary: '#4f4f4f',
      neutralTertiaryAlt: '#6d6d6d',
      neutralTertiary: '#c8c8c8',
      neutralSecondary: '#d0d0d0',
      neutralPrimaryAlt: '#dadada',
      neutralPrimary: '#ffffff',
      neutralDark: '#f4f4f4',
      black: '#f8f8f8',
      white: '#1f1f1f',
      themePrimary: '#3a96dd',
      themeLighterAlt: '#020609',
      themeLighter: '#091823',
      themeLight: '#112d43',
      themeTertiary: '#235a85',
      themeSecondary: '#3385c3',
      themeDarkAlt: '#4ba0e1',
      themeDark: '#65aee6',
      themeDarker: '#8ac2ec',
      accent: '#3a96dd'
    }
  };
  const appTheme = darkMode ? darkTheme : undefined;

  const base = (<div className={`qb-fluent ${compactMode ? "qb-compact" : ""} qb-${themeMode}`}>{children}</div>);
  const withProviders = (
    <ThemeProvider
      theme={appTheme}
    >{base}</ThemeProvider>
  );

  return withProviders;
};

export default {
  FluentUITextWidget,
  FluentUITextAreaWidget,
  FluentUIDateWidget,
  FluentUIDateTimeWidget,
  FluentUITimeWidget,
  FluentUISelectWidget,
  FluentUINumberWidget,
  FluentUIPriceWidget,
  FluentUISliderWidget,
  FluentUIBooleanWidget,
  FluentUIMultiSelectWidget,

  FluentUIFieldSelect,

  FluentUIIcon,
  FluentUIButton,
  FluentUIButtonGroup,
  FluentUIConjs,
  FluentUIValueSources,
  FluentUIConfirm,

  FluentUIProvider,
};
