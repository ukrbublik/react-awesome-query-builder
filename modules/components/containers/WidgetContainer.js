import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import { range, merge } from 'lodash';
import {
    getFieldConfig, getValueLabel, getOperatorConfig, getValueSourcesForFieldOp,
    getWidgetForFieldOp, getFieldWidgetConfig, getWidgetsForFieldOp
} from "../../utils/configUtils";
import {defaultValue} from "../../utils/stuff";
import { Icon, Popover, Button, Radio } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default (Widget) => {
    return class WidgetContainer extends Component {
        static propTypes = {
            config: PropTypes.object.isRequired,
            value: PropTypes.any.isRequired, //instanceOf(Immutable.List)
            valueSrc: PropTypes.any.isRequired, //instanceOf(Immutable.List)
            field: PropTypes.string.isRequired,
            operator: PropTypes.string.isRequired,
            //actions
            setValue: PropTypes.func,
            setValueSrc: PropTypes.func,
        };

        constructor(props) {
            super(props);

            this._setValueHandlers = {};
            this._setValueSrcHandlers = {};
        }

        _getSetValueHandler = (isSpecialRange, delta, widgetType) => {
            const k = ''+widgetType+'#'+(isSpecialRange ? 'r' : delta);
            let h = this._setValueHandlers[k];
            if (!h) {
                h = this._setValue.bind(this, isSpecialRange, delta, widgetType);
                this._setValueHandlers[k] = h;
            }
            return h;
        }

        _getSetValueSrcHandler = (delta) => {
            const k = ''+delta;
            let h = this._setValueSrcHandlers[k];
            if (!h) {
                h = this._onChangeValueSrc.bind(this, delta);
                this._setValueSrcHandlers[k] = h;
            }
            return h;
        }

        _setValue = (isSpecialRange, delta, widgetType, value) => {
            if (isSpecialRange && Array.isArray(value)) {
                const oldRange = [this.props.value.get(0), this.props.value.get(1)];
                if (oldRange[0] != value[0])
                    this.props.setValue(0, value[0], widgetType);
                if (oldRange[1] != value[1])
                    this.props.setValue(1, value[1], widgetType);
            } else {
                this.props.setValue(delta, value, widgetType);
            }
        }

        _onChangeValueSrc = (delta, e) => {
            let srcKey = e.target.value;
            this.props.setValueSrc(delta, srcKey);
        }

        shouldComponentUpdate = shallowCompare;

        renderWidget = (isSpecialRange, delta, valueSrc, widget, operatorDefinition) => {
            const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
            const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget, valueSrc);
            const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta, null, isSpecialRange);
            let valueLabels = null;
            let textSeparators = null;
            if (isSpecialRange) {
                valueLabels = [
                    getValueLabel(this.props.config, this.props.field, this.props.operator, 0),
                    getValueLabel(this.props.config, this.props.field, this.props.operator, 1)
                ];
                valueLabels = {
                    placeholder: [ valueLabels[0].placeholder, valueLabels[1].placeholder ],
                    label: [ valueLabels[0].label, valueLabels[1].label ],
                };
                textSeparators = operatorDefinition.textSeparators;
            }
            const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;
            const widgetType = widgetDefinition.type;

            if (!widgetFactory)
                return '?';
            
            let value = isSpecialRange ? 
                [this.props.value.get(0), this.props.value.get(1)] 
                : this.props.value.get(delta)
            ;
            if (isSpecialRange && value[0] === undefined && value[1] === undefined)
                value = undefined;
            let widgetProps = Object.assign({}, fieldWidgetProps, {
                path: this.props.path,
                config: this.props.config,
                field: this.props.field,
                operator: this.props.operator,
                delta: delta,
                isSpecialRange: isSpecialRange,
                value: value,
                label: valueLabel.label,
                placeholder: valueLabel.placeholder,
                placeholders: valueLabels ? valueLabels.placeholder : null,
                textSeparators: textSeparators,
                setValue: this._getSetValueHandler(isSpecialRange, delta, widgetType),
            });
            
            if (widget == 'field') {
                //
            }

            // add readonly mode support
            if (this.props.config.settings.readonlyMode) {
                widgetProps = merge(widgetProps, {
                    customProps: {
                        disabled: true
                    }
                });
            }

            return widgetFactory(widgetProps);
        }

        renderValueSorces = (delta, valueSources, valueSrc) => {
            const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
            const valueSourcesInfo = this.props.config.settings.valueSourcesInfo;
            const valueSourcesPopupTitle = this.props.config.settings.valueSourcesPopupTitle;
            //let valueSources = fieldDefinition.valueSources;
            //let valueSources = getValueSourcesForFieldOp(this.props.config, this.props.field, this.props.operator);

            if (!valueSources || Object.keys(valueSources).length == 1)
                return null;

            let content = (
                <RadioGroup
                    key={'valuesrc-'+delta}
                    value={valueSrc || "value"}
                    size={this.props.config.settings.renderSize || "small"}
                    onChange={this._getSetValueSrcHandler(delta)}
                >
                    {valueSources.map(srcKey => (
                        <RadioButton
                            key={srcKey}
                            value={srcKey}
                        //checked={item.checked}
                        >{valueSourcesInfo[srcKey].label}</RadioButton>
                    ))}
                </RadioGroup>
            );

            return (
                <span>
                    <Popover content={content} title={valueSourcesPopupTitle}>
                        <Icon type="ellipsis" />
                    </Popover>
                </span>
            );
        }

        render() {
            const settings = this.props.config.settings;
            const defaultWidget = getWidgetForFieldOp(this.props.config, this.props.field, this.props.operator);
            const widgets = getWidgetsForFieldOp(this.props.config, this.props.field, this.props.operator);
            const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
            const operatorDefinition = getOperatorConfig(this.props.config, this.props.operator, this.props.field);
            if (typeof fieldDefinition === 'undefined' || typeof operatorDefinition === 'undefined') {
                return null;
            }
            const isSpecialRange = operatorDefinition.isSpecialRange;
            const isSpecialRangeForSrcField = isSpecialRange && (this.props.valueSrc.get(0) == 'field' || this.props.valueSrc.get(1) == 'field');
            const isTrueSpecialRange = isSpecialRange && !isSpecialRangeForSrcField;
            const cardinality = isTrueSpecialRange ? 1 : defaultValue(operatorDefinition.cardinality, 1);
            if (cardinality === 0) {
                return null;
            }

            return (
                <Widget name={defaultWidget} config={this.props.config}>
                    {range(0, cardinality).map(delta => {
                        const valueSources = getValueSourcesForFieldOp(this.props.config, this.props.field, this.props.operator);
                        let valueSrc = this.props.valueSrc.get(delta) || null;
                        //if (!valueSrc && valueSources.length == 1) {
                        //    this.props.setValueSrc(delta, valueSources[0]);
                        //}
                        let widget = getWidgetForFieldOp(this.props.config, this.props.field, this.props.operator, valueSrc);
                        let widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget, valueSrc);
                        if (isSpecialRangeForSrcField) {
                            widget = widgetDefinition.singleWidget;
                            widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget, valueSrc);
                        }
                        const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta, valueSrc, isTrueSpecialRange);
                        let parts = [];
                        if (operatorDefinition.textSeparators) {
                            let sep = operatorDefinition.textSeparators[delta];
                            if (sep) {
                                parts.push((
                                    <div key={"widget-separators-"+delta} className="widget--sep" >
                                        {settings.showLabels ?
                                            <label>&nbsp;</label>
                                            : null}
                                        <span>{sep}</span>
                                    </div>
                                ));
                            }
                        }

                        if (valueSources.length > 1)
                            parts.push((
                                <div key={"valuesrc-"+this.props.field+"-"+delta} className="widget--valuesrc">
                                    {settings.showLabels ?
                                        <label>&nbsp;</label>
                                        : null}
                                    {this.renderValueSorces(delta, valueSources, valueSrc)}
                                </div>
                            ));

                        parts.push((
                            <div key={"widget-"+this.props.field+"-"+delta} className="widget--widget">
                                {settings.showLabels ?
                                    <label>{valueLabel.label}</label>
                                    : null}
                                {this.renderWidget(isTrueSpecialRange, delta, valueSrc, widget, operatorDefinition)}
                            </div>
                        ));

                        return parts;
                    })}
                </Widget>
            );
        }
    };
};
