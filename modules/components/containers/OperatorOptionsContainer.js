import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';

export default (OperatorOptions) => {
  return class OperatorOptionsContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      operatorOptions: PropTypes.instanceOf(Immutable.Map).isRequired,
      selectedField: PropTypes.string.isRequired,
      selectedOperator: PropTypes.string.isRequired,
      //actions
      setOperatorOption: PropTypes.func.isRequired,
    };

    shouldComponentUpdate = shallowCompare;

    render() {
      if (!this.props.selectedOperator)
        return null;
      const operatorDefinitions = this.props.config.operators[this.props.selectedOperator];
      if (typeof operatorDefinitions.options === 'undefined') {
        return null;
      }

      const { factory: optionsFactory, ...optionsProps } = operatorDefinitions.options;

      return (
        <OperatorOptions 
            name={this.props.selectedOperator}
            config={this.props.config}
        >
          {optionsFactory(Object.assign({}, optionsProps, {
            config: this.props.config,
            field: this.props.selectedField,
            operator: this.props.selectedOperator,
            options: this.props.operatorOptions,
            setOption: (name, value) => this.props.setOperatorOption(name, value)
          }))}
        </OperatorOptions>
      );
    }
  };
};
