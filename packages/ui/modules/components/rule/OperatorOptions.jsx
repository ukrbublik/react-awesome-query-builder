import React, { PureComponent } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
const {getOperatorConfig} = Utils.ConfigUtils;

export default class OperatorOptions extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    operatorOptions: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    selectedField: PropTypes.string.isRequired,
    selectedOperator: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    //actions
    setOperatorOption: PropTypes.func.isRequired,
  };

  render() {
    if (!this.props.selectedOperator)
      return null;
    const operatorDefinitions = getOperatorConfig(this.props.config, this.props.selectedOperator, this.props.selectedField);
    if (typeof operatorDefinitions.options === "undefined") {
      return null;
    }

    const { factory: optionsFactory, ...basicOptionsProps } = operatorDefinitions.options;
    const optionsProps = Object.assign({}, basicOptionsProps, {
      config: this.props.config,
      field: this.props.selectedField,
      operator: this.props.selectedOperator,
      options: this.props.operatorOptions,
      setOption: this.props.setOperatorOption,
      readonly: this.props.readonly,
    });
    const optionsCmp = optionsFactory(optionsProps);
    const name = this.props.selectedOperator;

    return (
      <div className={`rule--operator rule--operator--${name.toUpperCase()}`}>
        {optionsCmp}
      </div>
    );
  }
}
