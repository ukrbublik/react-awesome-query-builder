import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';
import map from 'lodash/map';
import {defaultValue, getFieldConfig, getValueLabel, getOperatorConfig, getWidgetForFieldOp, getFieldWidgetConfig} from "../../utils/index";
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

        renderWidget(delta, widget) {
            const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget);
            const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta);
            const valueSources = widgetDefinition.valueSources || this.props.config.settings.valueSources || {};
            const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;
            const valueSrc = this.props.valueSrc.get(delta) || 'value';
            const valueSrcInfo = valueSources[valueSrc] || {};
            if (valueSrc != 'value') {
                //todo....
                //widget = valueSrcInfo.widget;
            }

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

            return widgetFactory(widgetProps);
        }

        hasMultiValueSorces(delta) {
            const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator);
            const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;
            const valueSources = widgetDefinition.valueSources || this.props.config.settings.valueSources;
            return (valueSources && Object.keys(valueSources).length > 1);
        }

        renderValueSorces(delta) {
            const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator);
            const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;
            let valueSources = widgetDefinition.valueSources || this.props.config.settings.valueSources;
            if (!valueSources || Object.keys(valueSources).length == 1)
                return null;

            let content = (
              <RadioGroup 
                 key={'valuesrc-'+delta}
                 value={this.props.valueSrc.get(delta) || 'value'} 
                 size={this.props.config.settings.renderSize || "small"}
                 onChange={(e) => {let srcKey = e.target.value; return this.props.setValueSrc(delta, srcKey);}}
              >
              {map(valueSources, (srcInfo, srcKey) => (
                <RadioButton 
                  key={srcKey}
                  value={srcKey}
                  //checked={item.checked}
                >{srcInfo.label}</RadioButton>
              ))}
              </RadioGroup>
            );

            return (
                <span>
                    <Popover content={content} title={this.props.config.settings.valueSourcesPopupTitle}>
                        <Icon type="ellipsis" />
                    </Popover>
                </span>
            );
        }

        render() {
            const widget = getWidgetForFieldOp(this.props.config, this.props.field, this.props.operator);
            const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
            const operatorDefinition = getOperatorConfig(this.props.config, this.props.operator, this.props.field);
            if (typeof fieldDefinition === 'undefined' || typeof operatorDefinition === 'undefined') {
                return null;
            }
            const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget);
            if (typeof widgetDefinition === 'undefined') {
                return null;
            }

            const cardinality = defaultValue(operatorDefinition.cardinality, 1);
            if (cardinality === 0) {
                return null;
            }

            const settings = this.props.config.settings;

            if (typeof widgetBehavior === 'undefined') {
                return (
                    <Widget name={widget} config={this.props.config}>
                        {range(0, cardinality).map(delta => {
                            const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta);
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

                            if (this.hasMultiValueSorces(delta))
                                parts.push((
                                    <div key={"valuesrc-"+this.props.field+"-"+delta} className="widget--valuesrc">
                                        {settings.showLabels ?
                                            <label>&nbsp;</label>
                                        : null}
                                        {this.renderValueSorces.call(this, delta)}
                                    </div>
                                ));

                            parts.push((
                                <div key={"widget-"+this.props.field+"-"+delta} className="widget--widget">
                                    {settings.showLabels ?
                                        <label>{valueLabel.label}</label>
                                    : null}
                                    {this.renderWidget.call(this, delta, widget)}
                                </div>
                            ));

                            return parts;
                        })}
                    </Widget>
                );
            }

            return null;
        }
    };
};
