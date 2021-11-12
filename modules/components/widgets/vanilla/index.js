import React from "react";

// value widgets
export {default as VanillaBooleanWidget} from "./value/VanillaBoolean";
export {default as VanillaTextWidget} from "./value/VanillaText";
export {default as VanillaTextAreaWidget} from "./value/VanillaTextArea";
export {default as VanillaDateWidget} from "./value/VanillaDate";
export {default as VanillaTimeWidget} from "./value/VanillaTime";
export {default as VanillaDateTimeWidget} from "./value/VanillaDateTime";
export {default as VanillaMultiSelectWidget} from "./value/VanillaMultiSelect";
export {default as VanillaSelectWidget} from "./value/VanillaSelect";
export {default as VanillaNumberWidget} from "./value/VanillaNumber";
export {default as VanillaSliderWidget} from "./value/VanillaSlider";

// field select widget
export {default as VanillaFieldSelect} from "./core/VanillaFieldSelect";

// core components
export {default as VanillaConjs} from "./core/VanillaConjs";
export {default as VanillaButton} from "./core/VanillaButton";
export {default as VanillaButtonGroup} from "./core/VanillaButtonGroup";
export {default as VanillaValueSources} from "./core/VanillaValueSources";
export {default as VanillaSwitch} from "./core/VanillaSwitch";
export {default as vanillaConfirm} from "./core/vanillaConfirm";

export const VanillaProvider = ({config, children}) => children;
