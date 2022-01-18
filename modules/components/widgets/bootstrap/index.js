//bootstrap css
import "bootstrap/dist/css/bootstrap.min.css";

// value widgets
import BootstrapTextWidget from "./value/BootstrapText";
import BootstrapTextAreaWidget from "./value/BootstrapTextArea";
import BootstrapDateWidget from "./value/BootstrapDate";
import BootstrapDateTimeWidget from "./value/BootstrapDateTime";
import BootstrapTimeWidget from "./value/BootstrapTime";
import BootstrapSelectWidget from "./value/BootstrapSelect";
import BootstrapNumberWidget from "./value/BootstrapNumber";
import BootstrapSliderWidget from "./value/BootstrapSlider";
import BootstrapBooleanWidget from "./value/BootstrapBoolean";
import BootstrapMultiSelectWidget from "./value/BootstrapMultiSelect";

// field select widgets
import BootstrapFieldSelect from "./core/BootstrapFieldSelect";

// core components
import BootstrapButton from "./core/BootstrapButton";
import BootstrapButtonGroup from "./core/BootstrapButtonGroup";
import BootstrapConjs from "./core/BootstrapConjs";
import BootstrapValueSources from "./core/BootstrapValueSources";
import BootstrapConfirm from "./core/BootstrapConfirm";

// provider
const BootstrapProvider = ({config, children}) => children;

export default {
  BootstrapTextWidget,
  BootstrapTextAreaWidget,
  BootstrapDateWidget,
  BootstrapDateTimeWidget,
  BootstrapTimeWidget,
  BootstrapSelectWidget,
  BootstrapNumberWidget,
  BootstrapSliderWidget,
  BootstrapBooleanWidget,
  BootstrapMultiSelectWidget,

  BootstrapFieldSelect,

  BootstrapButton,
  BootstrapButtonGroup,
  BootstrapConjs,
  BootstrapValueSources,
  BootstrapConfirm,

  BootstrapProvider,
};
