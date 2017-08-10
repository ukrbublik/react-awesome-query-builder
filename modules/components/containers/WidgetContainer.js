import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';
import map from 'lodash/map';
import {defaultValue, getFieldConfig, getValueLabel, getOperatorConfig, getWidgetForFieldOp, getFieldWidgetConfig, getWidgetsForFieldOp} from "../../utils/index";
import { Icon, Popover, Button, Radio } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default (Widget) => {
    return class WidgetContainer extends Component {
        static propTypes = {
            config: PropTypes.object.isRequired,
            value: PropTypes.instanceOf(Immutable.List).isRequired,
            valueSrc: PropTypes.instanceOf(Immutable.List).isRequired,
            field: PropTypes.string.isRequired,
            operator: PropTypes.string.isRequired
        };

        shouldComponentUpdate = shallowCompare;

        renderWidget(delta, valueSrc, widget) {
            const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
            const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget, valueSrc);
            const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta);
            const valueSources = fieldDefinition.valueSources || {};
            const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;

            let widgetProps = Object.assign({}, fieldWidgetProps, {
                config: this.props.config,
                field: this.props.field,
                operator: this.props.operator,
                delta: delta,
                value: this.props.value.get(delta),
                label: valueLabel.label,
                placeholder: valueLabel.placeholder,
                setValue: value => this.props.setValue(delta, value)
            });
console.log(widgetProps);
            if (valueSrc != 'value') {
                //todo....
                //widget = valueSrcInfo.widget;
            }

            return widgetFactory(widgetProps);
        }

        renderValueSorces(delta, valueSrc) {
            const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
            const valueSourcesInfo = this.props.config.settings.valueSourcesInfo;
            const valueSourcesPopupTitle = this.props.config.settings.valueSourcesPopupTitle;
            let valueSources = fieldDefinition.valueSources;

            if (!valueSources || Object.keys(valueSources).length == 1)
                return null;

            let content = (
              <RadioGroup 
                 key={'valuesrc-'+delta}
                 value={valueSrc} 
                 size={this.props.config.settings.renderSize || "small"}
                 onChange={(e) => {let srcKey = e.target.value; return this.props.setValueSrc(delta, srcKey);}}
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
            const cardinality = defaultValue(operatorDefinition.cardinality, 1);
            if (cardinality === 0) {
                return null;
            }
            
            return (
                <Widget name={defaultWidget} config={this.props.config}>
                    {range(0, cardinality).map(delta => {
                        const valueSrc = this.props.valueSrc.get(delta) || 'value';
                        //const valueSources = fieldDefinition.valueSources || {};
                        //const valueSrcInfo = valueSources[valueSrc] || {};
                        const widget = getWidgetForFieldOp(this.props.config, this.props.field, this.props.operator, valueSrc);
                        const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget, valueSrc);
                        const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta, valueSrc);
                        let parts = [];
                        if (operatorDefinition.textSeparators) {
                            let sep = operatorDefinition.textSeparators[delta];
                            if (sep) {
                                parts.push((
                                    <div className="widget--sep">
                                        {settings.showLabels ?
                                            <label>&nbsp;</label>
                                        : null}
                                        <span>{sep}</span>
                                    </div>
                                ));
                            }
                        }

                        if (widgets.length > 1)
                            parts.push((
                                <div key={"valuesrc-"+this.props.field+"-"+delta} className="widget--valuesrc">
                                    {settings.showLabels ?
                                        <label>&nbsp;</label>
                                    : null}
                                    {this.renderValueSorces.call(this, delta, valueSrc)}
                                </div>
                            ));

                        parts.push((
                            <div key={"widget-"+this.props.field+"-"+delta} className="widget--widget">
                                {settings.showLabels ?
                                    <label>{valueLabel.label}</label>
                                : null}
                                {this.renderWidget.call(this, delta, valueSrc, widget)}
                            </div>
                        ));

                        return parts;
                    })}
                </Widget>
            );
        }
    };
};
