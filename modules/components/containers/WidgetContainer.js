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

        renderOptions(delta) {
            const operatorDefinitions = this.props.config.operators[this.props.operator];
            if (typeof operatorDefinitions.valueOptions === 'undefined') {
                return null;
            }

            const {factory: optionsFactory, ...optionsProps} = operatorDefinitions.valueOptions;

            return optionsFactory(Object.assign({}, optionsProps, {
                config: this.props.config,
                field: this.props.field,
                operator: this.props.operator,
                delta: delta,
                options: this.props.options.get(delta + '', new Immutable.Map()),
                setOption: (name, value) => this.props.setValueOption(delta, name, value)
            }));
        }

        renderWidget(delta, widget) {
            const {factory: widgetFactory, ...basicWidgetProps} = this.props.config.widgets[widget];
            const {widgetProps: fieldWidgetProps} = getFieldConfig(this.props.field, this.props.config);
            let widgetProps = Object.assign({}, basicWidgetProps, (fieldWidgetProps || {}), {
                config: this.props.config,
                field: this.props.field,
                operator: this.props.operator,
                delta: delta,
                value: this.props.value.get(delta),
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
                        {range(0, cardinality).map(delta => (
                            <Delta key={delta} delta={delta}>
                                {settings.showLabels ?
                                    <label>{getValueLabel(this.props.config, this.props.field, this.props.operator, delta, cardinality)}</label>
                                : null}
                                {this.renderWidget.call(this, delta, widget)}
                                {this.renderOptions.call(this, delta, widget)}
                            </Delta>
                        ))}
                    </Widget>
                );
            }

            // @todo Implement custom widget behavior rendering.
            // const widget = widgetFactory({
            //   definition: widgetDefinition,
            //   config: this.props.config,
            //   field: this.props.field,
            //   cardinality: cardinality,
            //   value: this.props.value,
            //   setValue: this.setValue.bind(this)
            // }, delta => this.props.operator.valueOptions ? this.props.operator.valueOptions.factory({
            //   definition: this.props.operator,
            //   config: this.props.config,
            //   field: this.props.field,
            //   delta: delta,
            //   options: this.props.valueOptions.get(delta),
            //   setOption: (name, value) => this.setValueOption.call(this, delta, name, value)
            // }) : null);

            return null;
        }
    };
};
