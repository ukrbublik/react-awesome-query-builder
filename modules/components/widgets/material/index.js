import React from "react";

export {default as MaterialTextWidget} from "./value/MaterialText";

// value widgets
import MaterialTextWidget from "./value/MaterialText";
import MaterialDateWidget from "./value/MaterialDate";
import MaterialDateTimeWidget from "./value/MaterialDateTime";
import MaterialTimeWidget from "./value/MaterialTime";
import MaterialSelectWidget from "./value/MaterialSelect";
import MaterialNumberWidget from "./value/MaterialNumber";
import MaterialSliderWidget from "./value/MaterialSlider";
import MaterialBooleanWidget from "./value/MaterialBoolean";
import MaterialMultiSelectWidget from "./value/MaterialMultiSelect";

// field select widgets
import MaterialFieldSelect from "./core/MaterialFieldSelect";

// core components
import MaterialButton from "./core/MaterialButton";
import MaterialButtonGroup from "./core/MaterialButtonGroup";
import MaterialConjs from "./core/MaterialConjs";
import MaterialValueSources from "./core/MaterialValueSources";
import MaterialConfirm from "./core/MaterialConfirm";

import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
const MaterialProvider = ({config, children}) => 
  <ThemeProvider 
    theme={createMuiTheme({
      ...config.settings.theme,
    }, config.settings.locale.material)}
  >{children}</ThemeProvider>
;

export default {
  MaterialTextWidget,
  MaterialDateWidget,
  MaterialDateTimeWidget,
  MaterialTimeWidget,
  MaterialSelectWidget,
  MaterialNumberWidget,
  MaterialSliderWidget,
  MaterialBooleanWidget,
  MaterialMultiSelectWidget,

  MaterialFieldSelect,

  MaterialButton,
  MaterialButtonGroup,
  MaterialConjs,
  MaterialValueSources,
  MaterialConfirm,

  MaterialProvider,
};
