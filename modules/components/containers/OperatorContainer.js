import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import shouldPureComponentUpdate from 'react-pure-render/function';

export default (Operator) => {
  return class OperatorContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      path: PropTypes.instanceOf(Immutable.List).isRequired,
      value: PropTypes.instanceOf(Immutable.List).isRequired,
      field: PropTypes.string.isRequired,
      operator: PropTypes.string.isRequired
    }

    shouldComponentUpdate = shouldPureComponentUpdate;

    setOperatorOption(name, value) {
      this.props.actions.setOperatorOption(this.props.path, name, value);
    }

    render() {
      const operatorDefinitions = this.props.config.operators[this.props.operator];
      if (typeof operatorDefinitions.options === 'undefined') {
        return null;
      }

      const { factory: optionsFactory, ...optionsProps } = operatorDefinitions.options;

      return (
        <Operator name={this.props.operator}>
          {optionsFactory(Object.assign({}, optionsProps, {
            config: this.props.config,
            field: this.props.field,
            operator: this.props.operator,
            options: this.props.options,
            setOption: (name, value) => this.setOperatorOption.call(this, name, value)
          }))}
        </Operator>
      );
    }
  };
};
