import React from 'react';

// value widgets
export { default as DateWidget } from "./value/Date";
export { default as DateTimeWidget } from "./value/DateTime";
export { default as TimeWidget } from "./value/Time";
export { default as SelectWidget } from "./value/Select";
export { default as TextWidget } from "./value/Text";
export { default as NumberWidget } from "./value/Number";
export { default as SliderWidget } from "./value/Slider";
export { default as RangeWidget } from "./value/Range";
export { default as BooleanWidget } from "./value/Boolean";
export { default as MultiSelectWidget } from "./value/MultiSelect";
export { default as TreeSelectWidget } from "./value/TreeSelect";

// field select widgets
export { default as FieldSelect } from "./core/FieldSelect";
export { default as FieldDropdown } from "./core/FieldDropdown";
export { default as FieldCascader } from "./core/FieldCascader";
export { default as FieldTreeSelect } from "./core/FieldTreeSelect";

// core components
export { default as Button } from "./core/Button";
export { default as ButtonGroup } from "./core/ButtonGroup";
export { default as Conjs } from "./core/Conjs";
export { default as ValueSources } from "./core/ValueSources";
export { default as confirm } from "./core/confirm";

import { ConfigProvider } from 'antd';
export const Provider = ({config, children}) => <ConfigProvider locale={config.settings.locale.antd}>{children}</ConfigProvider>;
