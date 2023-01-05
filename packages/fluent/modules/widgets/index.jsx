import { initializeIcons } from "@fluentui/font-icons-mdl2";
initializeIcons();

// value widgets
import FluentUITextWidget from "./value/FluentUIText";
import FluentUITextAreaWidget from "./value/FluentUITextArea";
import FluentUIDateWidget from "./value/FluentUIDate";
import FluentUIDateTimeWidget from "./value/FluentUIDateTime";
import FluentUITimeWidget from "./value/FluentUITime";
import FluentUISelectWidget from "./value/FluentUISelect";
import FluentUINumberWidget from "./value/FluentUINumber";
import FluentUISliderWidget from "./value/FluentUISlider";
import FluentUIBooleanWidget from "./value/FluentUIBoolean";
import FluentUIMultiSelectWidget from "./value/FluentUIMultiSelect";

// field select widgets
import FluentUIFieldSelect from "./core/FluentUIFieldSelect";

// core components
import FluentUIButton from "./core/FluentUIButton";
import FluentUIButtonGroup from "./core/FluentUIButtonGroup";
import FluentUIConjs from "./core/FluentUIConjs";
import FluentUIValueSources from "./core/FluentUIValueSources";
import FluentUIConfirm from "./core/FluentUIConfirm";

// provider
const FluentUIProvider = ({config, children}) => children;


export default {
  FluentUITextWidget,
  FluentUITextAreaWidget,
  FluentUIDateWidget,
  FluentUIDateTimeWidget,
  FluentUITimeWidget,
  FluentUISelectWidget,
  FluentUINumberWidget,
  FluentUISliderWidget,
  FluentUIBooleanWidget,
  FluentUIMultiSelectWidget,

  FluentUIFieldSelect,

  FluentUIButton,
  FluentUIButtonGroup,
  FluentUIConjs,
  FluentUIValueSources,
  FluentUIConfirm,

  FluentUIProvider,
};
