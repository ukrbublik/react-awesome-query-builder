import { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import queryString from '../utils/queryString';

var stringify = require('json-stringify-safe');

export default class Preview extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  render() {
    return this.props.children(queryString(this.props.tree, this.props.config));
  }
}
