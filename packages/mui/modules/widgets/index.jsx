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
import MuiPriceWidget from "./value/MuiPrice";
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
  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = config.settings.compactMode;
  const settingsTheme = config.settings.theme;
  const settingsLocale = config.settings.locale;
  const momentLocale = settingsLocale?.moment;
  const themeConfig = settingsTheme?.mui;
  const localeConfig = settingsLocale?.mui;
  const theme = createTheme(themeConfig ?? {
    palette: {
      mode: themeMode,
    }
  }, localeConfig ?? {});

  const locProviderProps = xdpVersion >= 6 ? {
    locale: momentLocale,
  } : {
    adapterLocale: momentLocale,
  };

  const UpdCssVars = () => {
    const theme = useTheme();
    const ref = React.createRef();
    React.useEffect(() => {
      console.log('MUI theme', theme);
      const { palette, typography, shadows } = theme;
      const setOpacity = (hex, alpha) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2, 0)}`;
      const r = document.querySelector(":root");
      const w = ref.current?.closest(".qb-mui");
      const cssVarsTarget = w ?? r;
      const cssVars = {
        "--rule-background": palette.mode === "dark" ? setOpacity(palette.grey[800], 0.3) : palette.background.paper,
        "--group-background": palette.mode === "dark" ? setOpacity(palette.grey[900], 0.8) : setOpacity(palette.grey[600], 0.1),
        "--rulegroup-background": palette.mode === "dark" ? setOpacity(palette.grey[900], 0.3) : setOpacity(palette.grey[400], 0.1),
        "--rulegroupext-background": palette.mode === "dark" ? setOpacity(palette.grey[900], 0.3) : setOpacity(palette.grey[400], 0.1),
        "--rule-border-color": palette.mode === "dark" ? palette.primary.main : palette.action.active,
        "--group-border-color": palette.mode === "dark" ? palette.secondary.main : palette.secondary.main,
        "--rulegroup-border-color": palette.mode === "dark" ? palette.secondary.main : palette.secondary.main,
        "--rulegroupext-border-color": palette.mode === "dark" ? palette.secondary.main : palette.secondary.main,
        //"--group-in-rulegroupext-border-color": palette.secondary.main,
        "--treeline-color": palette.divider,
     //   "--treeline-disabled-color": palette.action.disabledBackground,
        "--main-text-color": palette.text.secondary,
        "--main-font-family": typography.fontFamily,
        "--main-font-size": typography.fontSize,
        "--rule-shadow": shadows[0],
        "--rule-shadow-hover": shadows[1]
      };
      console.log('MUI cssVars', cssVars);
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
    return <div ref={ref} style={{display: "none"}} />;
  };

  const base = (<div className={`qb-mui ${compactMode ? "qb-compact" : ""}`}><UpdCssVars />{children}</div>);
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
  MuiPriceWidget,
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
