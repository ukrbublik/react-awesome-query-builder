import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';
import Delta from '../Delta';
import {defaultValue, getFieldConfig, getValueLabel} from "../../utils/index";


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
            const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta);
            const {factory: widgetFactory, ...basicWidgetProps} = this.props.config.widgets[widget];
            const {widgetProps: fieldWidgetProps} = getFieldConfig(this.props.field, this.props.config);
            let widgetProps = Object.assign({}, basicWidgetProps, (fieldWidgetProps || {}), {
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
            const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
            const operatorDefinition = this.props.config.operators[this.props.operator];
            if (typeof fieldDefinition === 'undefined' || typeof operatorDefinition === 'undefined') {
                return null;
            }
            const widget = defaultValue(operatorDefinition.widget, fieldDefinition.widget);
            const widgetDefinition = this.props.config.widgets[widget];
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
                    <Widget name={widget}>
                        {range(0, cardinality).map(delta => {
                            const valueLabel = getValueLabel(this.props.config, this.props.field, this.props.operator, delta);
                            return (
                                <Delta key={delta} delta={delta}>
                                    {settings.showLabels ?
                                        <label>{valueLabel.label}</label>
                                    : null}
                                    {this.renderWidget.call(this, delta, widget)}
                                </Delta>
                            );
                        })}
                    </Widget>
                );
            }

            return null;
        }
    };
};
