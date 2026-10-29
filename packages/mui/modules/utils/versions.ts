// Used to keep compatibility with multiple versions of @mui/material (v5 - v9) and @mui/x-date-pickers (v5 - v9)

import { version as muiVersionStr } from "@mui/material/version";
import xdpPackage from "@mui/x-date-pickers/package.json";

const parseMajor = (version?: string) => parseInt(version?.split(".")?.[0] ?? "0");

export const muiVersion = parseMajor(muiVersionStr);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const xdpVersion = parseMajor(xdpPackage?.version as string | undefined);

// TextField: `InputProps`, `inputProps` are deprecated since v6 and removed in v9 in favor of `slotProps`
export const textFieldInputProps = (
  input?: Record<string, unknown>,
  htmlInput?: Record<string, unknown>,
) => {
  if (muiVersion >= 6) {
    return {
      slotProps: {
        ...(input ? { input } : {}),
        ...(htmlInput ? { htmlInput } : {}),
      },
    };
  } else {
    return {
      ...(input ? { InputProps: input } : {}),
      ...(htmlInput ? { inputProps: htmlInput } : {}),
    };
  }
};
