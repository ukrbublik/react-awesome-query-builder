import React from 'react';

// value widgets
export {default as VanillaBooleanWidget} from './VanillaBooleanWidget';

// field select widget
export {default as VanillaFieldSelect} from './VanillaFieldSelect';

// core components
export {default as VanillaConjs} from './VanillaConjs';
export {default as VanillaButton} from './VanillaButton';
export {default as VanillaButtonGroup} from './VanillaButtonGroup';
export {default as VanillaValueSources} from "./VanillaValueSources";
export {default as vanillaConfirm} from "./vanillaConfirm";

export const VanillaProvider = ({config, children}) => children;
