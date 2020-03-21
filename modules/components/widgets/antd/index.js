import React from 'react';

// value widgets
export { default as DateWidget } from "./Date";
export { default as DateTimeWidget } from "./DateTime";
export { default as TimeWidget } from "./Time";
export { default as SelectWidget } from "./Select";
export { default as TextWidget } from "./Text";
export { default as NumberWidget } from "./Number";
export { default as SliderWidget } from "./Slider";
export { default as RangeWidget } from "./Range";
export { default as BooleanWidget } from "./Boolean";
export { default as MultiSelectWidget } from "./MultiSelect";
export { default as TreeSelectWidget } from "./TreeSelect";

// field select widgets
export { default as FieldSelect } from "./FieldSelect";
export { default as FieldDropdown } from "./FieldDropdown";
export { default as FieldCascader } from "./FieldCascader";
export { default as FieldTreeSelect } from "./FieldTreeSelect";

// core components
export { default as Button } from "./Button";
export { default as ButtonGroup } from "./ButtonGroup";
export { default as Conjs } from "./Conjs";
export { default as ValueSources } from "./ValueSources";
export { default as confirm } from "./confirm";

import { ConfigProvider } from 'antd';
export const Provider = ({config, children}) => <ConfigProvider locale={config.settings.locale.antd}>{children}</ConfigProvider>;
