import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import queryString from '../utils/queryString';
import Immutable from 'immutable';
var stringify = require('json-stringify-safe');

export default class Preview extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    tree: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
  };

  shouldComponentUpdate = shallowCompare;

  render() {
    return this.props.children(queryString(this.props.tree, this.props.config));
  }
}
