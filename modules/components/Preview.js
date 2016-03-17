import { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import queryString from '../utils/queryString';

var stringify = require('json-stringify-safe');

export default class Preview extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired
  };

  shouldComponentUpdate = shallowCompare;

  render() {
    return this.props.children(queryString(this.props.tree, this.props.config));
  }
}
