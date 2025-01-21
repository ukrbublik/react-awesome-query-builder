import React from "react";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"; // TODO: set moment to dayjs
import xdpPackage from "@mui/x-date-pickers/package.json"; // to determine version

const xdpVersion = parseInt(xdpPackage?.version?.split(".")?.[0] ?? "0");

// value widgets
import MuiTextWidget from "./value/MuiText";
import MuiTextAreaWidget from "./value/MuiTextArea";
import MuiDateWidget from "./value/MuiDate";
import MuiDateTimeWidget from "./value/MuiDateTime";
import MuiTimeWidget from "./value/MuiTime";
import MuiSelectWidget from "./value/MuiSelect";
import MuiNumberWidget from "./value/MuiNumber";
import MuiSliderWidget from "./value/MuiSlider";
import MuiRangeWidget from "./value/MuiRange";
import MuiBooleanWidget from "./value/MuiBoolean";
import MuiMultiSelectWidget from "./value/MuiMultiSelect";
import MuiAutocompleteWidget from "./value/MuiAutocomplete";

// field select widgets
import MuiFieldSelect from "./core/MuiFieldSelect";
import MuiFieldAutocomplete from "./core/MuiFieldAutocomplete";

// core components
import MuiIcon from "./core/MuiIcon";
import MuiButton from "./core/MuiButton";
import MuiButtonGroup from "./core/MuiButtonGroup";
import MuiConjs from "./core/MuiConjs";
import MuiSwitch from "./core/MuiSwitch";
import MuiValueSources from "./core/MuiValueSources";
import MuiConfirm from "./core/MuiConfirm";

// provider
const MuiProvider = ({config, children}) => {
  const settingsTheme = config.settings.theme || {};
  const settingsLocale = config.settings.locale || {};
  const momentLocale = settingsLocale.moment;
  const themeConfig = settingsTheme.mui;
  const locale = settingsLocale.mui;
  const theme = createTheme(themeConfig, locale, { 
    palette: {
      // neutral: {
      //   main: "#64748B",
      //   contrastText: "#fff"
      // },
    }
  });

  const locProviderProps = xdpVersion >= 6 ? {
    locale: momentLocale,
  } : {
    adapterLocale: momentLocale,
  };

  const UpdCssVars = () => {
    const theme = useTheme();
    console.log('MUI theme', theme);
    const { palette, typography } = theme;
    const r = document.querySelector(":root");

    const cssVars = {
      "--rule-background": palette.mode === "dark" ? palette.grey[800] : palette.background.paper,
      "--group-background": palette.mode === "dark" ? palette.grey[900] : palette.grey[50],
      "--rulegroup-background": palette.mode === "dark" ? palette.grey[900] : palette.grey[100],
      "--rulegroupext-background": palette.mode === "dark" ? palette.grey[900] : palette.grey[100],
      "--rule-border-color": palette.primary.main,
      "--group-border-color": palette.primary.main,
      "--rulegroup-border-color": palette.primary.main,
      "--rulegroupext-border-color": palette.primary.main,
      "--treeline-color": palette.secondary.main,
      '--treeline-disabled-color': palette.action.disabledBackground,
      "--main-text-color": palette.text.secondary,
      "--main-font-family": typography.fontFamily,
      "--main-font-size": typography.fontSize,
    };
    console.log('MUI cssVars', cssVars);
    for (const k in cssVars) {
      r.style.setProperty(k, cssVars[k]);
    }
    return null;
  };

  const base = (<div className="mui"><UpdCssVars />{children}</div>);
  const withProviders = (
    <LocalizationProvider dateAdapter={AdapterMoment} {...locProviderProps} >
      <ConfirmProvider>
        {base}
      </ConfirmProvider>
    </LocalizationProvider>
  );
  const withTheme = theme ? (
    <ThemeProvider theme={theme}>
      {withProviders}
    </ThemeProvider>
  ) : withProviders;

  return withTheme;
};


export default {
  MuiTextWidget,
  MuiTextAreaWidget,
  MuiDateWidget,
  MuiDateTimeWidget,
  MuiTimeWidget,
  MuiSelectWidget,
  MuiNumberWidget,
  MuiSliderWidget,
  MuiRangeWidget,
  MuiBooleanWidget,
  MuiMultiSelectWidget,
  MuiAutocompleteWidget,

  MuiFieldSelect,
  MuiFieldAutocomplete,

  MuiIcon,
  MuiButton,
  MuiButtonGroup,
  MuiConjs,
  MuiSwitch,
  MuiValueSources,
  MuiConfirm,
  MuiUseConfirm: useConfirm,

  MuiProvider,
};
