import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';
import {defaultValue, getFieldConfig, getValueLabel, getOperatorConfig, getWidgetForFieldOp, getFieldWidgetConfig} from "../../utils/index";


export default (Widget) => {
    return class WidgetContainer extends Component {
        static propTypes = {
            config: PropTypes.object.isRequired,
            value: PropTypes.instanceOf(Immutable.List).isRequired,
            field: PropTypes.string.isRequired,
            operator: PropTypes.string.isRequired
        };

        shouldComponentUpdate = shallowCompare;

        renderWidget(delta, widget) {
            const widgetDefinition = getFieldWidgetConfig(this.props.config, this.props.field, this.props.operator, widget);
            const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta);
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
            
            return widgetFactory(widgetProps);
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
