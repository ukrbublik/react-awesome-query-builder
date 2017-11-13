import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import OperatorOptionsContainer from './containers/OperatorOptionsContainer';

@OperatorOptionsContainer
export default class OperatorOptions extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
  };

  shouldComponentUpdate = shallowCompare;

  render() {
    return (
      <div className={`rule--operator rule--operator--${this.props.name.toUpperCase()}`}>
        {this.props.children}
      </div>
    );
  }
}
