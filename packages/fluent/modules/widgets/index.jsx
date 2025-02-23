import React from "react";

import { initializeIcons } from "@fluentui/font-icons-mdl2";
import { ThemeProvider, useTheme } from "@fluentui/react";
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
  const ref = React.createRef();
  const themeMode = config.settings.themeMode ?? "light";
  const darkMode = config.settings.themeMode === "dark";
  const compactMode = config.settings.compactMode;
  // todo: theme obj can be set in settings

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

  const UpdCssVars = () => {
    const theme = useTheme();
    React.useEffect(() => {
      const cssVarsTarget = ref.current;
      const cssVars = themeToCssVars(theme, darkMode);
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
    }, [theme]);
    return <div style={{display: "none"}} />;
  };

  const base = (<div ref={ref} className={`qb-fluent ${compactMode ? "qb-compact" : ""} qb-${themeMode}`}><UpdCssVars />{children}</div>);
  const withProviders = (
    <ThemeProvider
      theme={appTheme}
    >{base}</ThemeProvider>
  );

  return withProviders;
};

const themeToCssVars = (theme, darkMode) => {
  // console.log("fluent theme", theme);
  const { fonts, effects, semanticColors } = theme;
  return {
    "--rule-background": semanticColors.cardStandoutBackground,
    "--group-background": semanticColors.menuItemBackgroundHovered,
    "--rulegroup-background": semanticColors.defaultStateBackground,
    "--rulegroupext-background": semanticColors.defaultStateBackground,
    "--switch-background": semanticColors.defaultStateBackground,
    "--case-background": semanticColors.defaultStateBackground,

    "--rule-border-color": semanticColors.variantBorder,
    "--group-border-color": semanticColors.inputBorder,
    "--rulegroup-border-color": semanticColors.disabledBorder,
    "--rulegroupext-border-color": semanticColors.disabledBorder,
    "--switch-border-color": semanticColors.disabledBorder,
    "--case-border-color": semanticColors.inputFocusBorderAlt
    ,

    "--treeline-color": semanticColors.accentButtonBackground,
    "--treeline-switch-color": semanticColors.accentButtonBackground,

    "--main-text-color": semanticColors.bodyText,
    "--main-font-family": fonts.medium.fontFamily,
    "--main-font-size": fonts.medium.fontSize,
    "--item-radius": effects.roundedCorner2,
    
    "--rule-shadow-hover": effects.elevation4,
    "--group-shadow-hover": effects.elevation4,
    "--rulegroup-shadow-hover": effects.elevation4,
    "--rulegroupext-shadow-hover": effects.elevation4,
  };
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
