import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import OperatorOptionsContainer from "./containers/OperatorOptionsContainer";

@OperatorOptionsContainer
export default class OperatorOptions extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
  };

  render() {
    return (
      <div className={`rule--operator rule--operator--${this.props.name.toUpperCase()}`}>
        {this.props.children}
      </div>
    );
  }
}
