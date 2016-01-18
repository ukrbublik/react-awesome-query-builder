import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import OperatorContainer from './containers/OperatorContainer';

@OperatorContainer
export default class Operator extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  render() {
    return (
      <div className={`rule--operator rule--operator--${this.props.name.toUpperCase()}`}>{this.props.children}</div>
    );
  }
}
