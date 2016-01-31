import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import WidgetContainer from './containers/WidgetContainer';
import {Col} from "react-bootstrap";

@WidgetContainer
export default class Widget extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  render() {
    return (
      <Col xs={8} className={`rule--widget rule--widget--${this.props.name.toUpperCase()}`}>{this.props.children}</Col>
    );
  }
}
