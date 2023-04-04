import { styled } from "@mui/material/styles";

export const StyledWrapper = styled("div")(({ theme }) => ({
  margin: "0 2rem",
  color: theme.palette.text.primary,

  "& .group": {
    backgroundColor: "transparent",
    border: `1px solid ${theme.palette.primary.main}`,
  },
  "& .group--drag-handler": {
    top: 0,

    "& svg": {
      display: "inline",
    },
  },
  "& .group--conjunctions": {
    display: "contents",
  },
  "& .rule": {
    backgroundColor: theme.palette.secondary.lightPaper,
  },
  "& .rule--body--wrapper": {
    justifyContent: "center",
  },
  "& .rule--body": {
    display: "flex",
    alignItems: "center",
  },
  "& .widget--sep": {
    marginRight: 5,
    marginBottom: "4px !important",
  },
  "& .rule--drag-handler > svg": {
    fill: theme.palette.secondary.main,
  },
  "& .widget--widget > .MuiFormControl-root > div > div": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiIconButton-colorSecondary": {
    color: theme.palette.secondary.main,
  },
  "& .MuiSwitch-root": {
    margin: "-4px 0",
  },
}));
