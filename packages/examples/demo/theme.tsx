import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface PaletteColor {
    darker: string;
    mediumDark: string;
    lightPaper: string;
    chart: string;
    greyPalette: string[];
  }
  interface SimplePaletteColorOptions {
    darker?: string;
    mediumDark?: string;
    lightPaper?: string;
    chart?: string;
    greyPalette?: string[];
  }
}

const whiteColor = "#FFFFFF";
const primaryMainColor = "#AEC53D";
const primaryDarkColor = "#686e4d";
const backgroundDefaultColor = "#272731";
const greyColor = "#ACACAC";
const greyNaturalColor = "#787d8c";
const ultraLightKhakiColor = "#585b5f";

export const theme = createTheme({
  palette: {
    primary: {
      main: primaryMainColor,
      dark: primaryDarkColor,
    },
    warning: {
      main: "#BA7543",
      dark: "#775F57",
    },
    error: {
      main: "#B7483F",
      dark: "#745157",
    },
    secondary: {
      light: whiteColor,
      main: greyColor,
      dark: "", // free
      mediumDark: "#5A5A5A",
      darker: "#4B4954",
      lightPaper: "#3c3c4a",
      chart: greyNaturalColor,
      contrastText: "#000000",
      greyPalette: ["#404040", "#4d4d4d", "#595959", "#666666"],
    },
    background: {
      default: backgroundDefaultColor,
      paper: "#31313D",
    },
    text: {
      primary: whiteColor,
      secondary: "#B3B3B4",
      disabled: "#737373",
    },
  },
  typography: {
    fontSize: 20,
  },
  components: {
    MuiButtonGroup: {
      styleOverrides: {
        grouped: {
          width: "auto",
          minWidth: 50,
          textTransform: "uppercase",
          padding: "4px 10px",
          lineHeight: 1.75,
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: whiteColor,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1.4rem",
          lineHeight: 1.2,
          textTransform: "none",
          boxShadow: "none",

          "&.Mui-disabled": {
            backgroundColor: greyColor,
            color: backgroundDefaultColor,
          },
          "&:hover": {
            boxShadow: "none",
          },
          "&.MuiButton-containedNeutral": {
            backgroundColor: ultraLightKhakiColor,
          },
          "&.MuiButton-textNeutral": {
            color: primaryMainColor,
          },
        },
        containedSizeLarge: {
          width: 220,
        },
        containedSizeMedium: {
          width: 120,
        },
        containedSizeSmall: {
          width: 120,
          padding: "3px 10px",
        },
        containedPrimary: {
          fontWeight: "bold",
          borderRadius: 5,
          color: backgroundDefaultColor,
        },
        containedSecondary: {
          backgroundColor: primaryMainColor,

          "&:hover": {
            backgroundColor: primaryDarkColor,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid${greyColor}`,
          borderRadius: 5,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "0 24px 20px",
          justifyContent: "space-between",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "5px 12px",
        },
        notchedOutline: {
          borderColor: greyColor,
          borderRadius: 0,

          "&:hover": {
            borderColor: `${greyColor} !important`,
          },
          "&:focus, &:target": {
            borderColor: `${primaryMainColor} !important`,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          margin: 0,
          lineHeight: 1.2,
          fontSize: "0.8rem",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: whiteColor,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          padding: "10px 0",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        clearIndicator: {
          color: whiteColor,
        },
        popupIndicator: {
          color: whiteColor,
          padding: 0,
        },
        tag: {
          height: 17,
        },
        option: {
          textOverflow: "ellipsis",
          position: "relative",
          paddingLeft: "32px !important",
          display: "block !important",

          "& .MuiCheckbox-root": {
            position: "absolute",
            left: 0,
            top: -1,
            padding: 8,
          },
        },
        groupLabel: {
          lineHeight: "30px",
        },
        // endAdornment: {
        //   top: 'calc(50% - 13px)',
        // },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 5,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        grouped: {
          "&.MuiToggleButton-root": {
            color: whiteColor,
            backgroundColor: ultraLightKhakiColor,
            fontWeight: "bold",
            borderRadius: 5,
          },
          "&.Mui-selected": {
            color: whiteColor,
            backgroundColor: primaryMainColor,

            "&:hover": {
              backgroundColor: primaryDarkColor,
            },
          },
          "&:not(:first-of-type)": {
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 0,
          },
          "&:not(:last-of-type)": {
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
          },
        },
      },
    },
  },
});
