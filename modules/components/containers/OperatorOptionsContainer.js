import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import {getOperatorConfig} from "../../utils/configUtils";

export default (OperatorOptions) => {
  return class OperatorOptionsContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      operatorOptions: PropTypes.any.isRequired,
      selectedField: PropTypes.string.isRequired,
      selectedOperator: PropTypes.string.isRequired,
      //actions
      setOperatorOption: PropTypes.func.isRequired,
    };

    shouldComponentUpdate = shallowCompare;

    render() {
      if (!this.props.selectedOperator)
        return null;
      const operatorDefinitions = getOperatorConfig(this.props.config, this.props.selectedOperator, this.props.selectedField);
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
            setOption: this.props.setOperatorOption,
          }))}
        </OperatorOptions>
      );
    }
  };
};
