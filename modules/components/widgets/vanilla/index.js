import React from 'react';

// value widgets
export {default as VanillaBooleanWidget} from './value/VanillaBoolean';
export {default as VanillaTextWidget} from './value/VanillaText';
export {default as VanillaDateWidget} from './value/VanillaDate';
export {default as VanillaTimeWidget} from './value/VanillaTime';
export {default as VanillaDateTimeWidget} from './value/VanillaDateTime';

// field select widget
export {default as VanillaFieldSelect} from './core/VanillaFieldSelect';

// core components
export {default as VanillaConjs} from './core/VanillaConjs';
export {default as VanillaButton} from './core/VanillaButton';
export {default as VanillaButtonGroup} from './core/VanillaButtonGroup';
export {default as VanillaValueSources} from "./core/VanillaValueSources";
export {default as vanillaConfirm} from "./core/vanillaConfirm";

export const VanillaProvider = ({config, children}) => children;
