import React from "react";
import { useConfirm } from "material-ui-confirm";

// value widgets
import MaterialTextWidget from "./value/MaterialText";
import MaterialTextAreaWidget from "./value/MaterialTextArea";
import MaterialDateWidget from "./value/MaterialDate";
import MaterialDateTimeWidget from "./value/MaterialDateTime";
import MaterialTimeWidget from "./value/MaterialTime";
import MaterialSelectWidget from "./value/MaterialSelect";
import MaterialNumberWidget from "./value/MaterialNumber";
import MaterialPriceWidget from "./value/MaterialPrice";
import MaterialSliderWidget from "./value/MaterialSlider";
import MaterialRangeWidget from "./value/MaterialRange";
import MaterialBooleanWidget from "./value/MaterialBoolean";
import MaterialMultiSelectWidget from "./value/MaterialMultiSelect";
import MaterialAutocompleteWidget from "./value/MaterialAutocomplete";

// field select widgets
import MaterialFieldSelect from "./core/MaterialFieldSelect";
import MaterialFieldAutocomplete from "./core/MaterialFieldAutocomplete";

// core components
import MaterialIcon from "./core/MaterialIcon";
import MaterialButton from "./core/MaterialButton";
import MaterialButtonGroup from "./core/MaterialButtonGroup";
import MaterialConjs from "./core/MaterialConjs";
import MaterialSwitch from "./core/MaterialSwitch";
import MaterialValueSources from "./core/MaterialValueSources";
import MaterialConfirm from "./core/MaterialConfirm";
import { MaterialProvider } from "./core/MaterialProvider";


export default {
  MaterialTextWidget,
  MaterialTextAreaWidget,
  MaterialDateWidget,
  MaterialDateTimeWidget,
  MaterialTimeWidget,
  MaterialSelectWidget,
  MaterialNumberWidget,
  MaterialPriceWidget,
  MaterialSliderWidget,
  MaterialRangeWidget,
  MaterialBooleanWidget,
  MaterialMultiSelectWidget,
  MaterialAutocompleteWidget,

  MaterialFieldSelect,
  MaterialFieldAutocomplete,

  MaterialIcon,
  MaterialButton,
  MaterialButtonGroup,
  MaterialConjs,
  MaterialSwitch,
  MaterialValueSources,
  MaterialConfirm,
  MaterialUseConfirm: useConfirm,

  MaterialProvider,
};
