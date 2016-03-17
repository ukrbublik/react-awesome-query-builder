import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import OperatorContainer from './containers/OperatorContainer';

@OperatorContainer
export default class Operator extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
  };

  shouldComponentUpdate = shallowCompare;

  render() {
    return (
      <div className={`rule--operator rule--operator--${this.props.name.toUpperCase()}`}>{this.props.children}</div>
    );
  }
}
