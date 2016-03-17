import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';
import Delta from '../Delta';

export default (Widget) => {
  return class WidgetContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      path: PropTypes.instanceOf(Immutable.List).isRequired,
      value: PropTypes.instanceOf(Immutable.List).isRequired,
      field: PropTypes.string.isRequired,
      operator: PropTypes.string.isRequired
    };

    shouldComponentUpdate = shallowCompare;

    setValue(delta, value) {
      this.props.actions.setValue(this.props.path, delta, value);
    }

    setValueOption(delta, name, value) {
      this.props.actions.setValueOption(this.props.path, delta, name, value);
    }

    renderOptions(delta) {
      const operatorDefinitions = this.props.config.operators[this.props.operator];
      if (typeof operatorDefinitions.valueOptions === 'undefined') {
        return null;
      }

      const { factory: optionsFactory, ...optionsProps } = operatorDefinitions.valueOptions;

      return optionsFactory(Object.assign({}, optionsProps, {
        config: this.props.config,
        field: this.props.field,
        operator: this.props.operator,
        delta: delta,
        options: this.props.options.get(delta + '', new Immutable.Map()),
        setOption: (name, value) => this.setValueOption.call(this, delta, name, value)
      }));
    }

    renderWidget(delta) {
      const fieldDefinition = this.props.config.fields[this.props.field];
      const { factory: widgetFactory, ...widgetProps } = this.props.config.widgets[fieldDefinition.widget];

      return widgetFactory(Object.assign({}, widgetProps, {
        config: this.props.config,
        field: this.props.field,
        operator: this.props.operator,
        delta: delta,
        value: this.props.value.get(delta),
        setValue: value => this.setValue.call(this, delta, value)
      }));
    }

    render() {
      const fieldDefinition = this.props.config.fields[this.props.field];
      const operatorDefinition = this.props.config.operators[this.props.operator];
      if (typeof fieldDefinition === 'undefined' || typeof operatorDefinition === 'undefined') {
        return null;
      }

      const widgetDefinition = this.props.config.widgets[fieldDefinition.widget];
      if (typeof widgetDefinition === 'undefined') {
        return null;
      }

      const cardinality = operatorDefinition.cardinality || 1;
      if (cardinality === 0) {
        return null;
      }

      if (typeof widgetBehavior === 'undefined') {
        return (
          <Widget name={fieldDefinition.widget}>
            {range(0, cardinality).map(delta => (
              <Delta key={delta} delta={delta}>
                {this.renderWidget.call(this, delta)}
                {this.renderOptions.call(this, delta)}
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
