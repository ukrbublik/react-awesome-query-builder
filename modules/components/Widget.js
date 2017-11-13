import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import WidgetContainer from './containers/WidgetContainer';
import { Row, Col } from 'antd';

@WidgetContainer
export default class Widget extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
  };

  shouldComponentUpdate = shallowCompare;

  render() {
    return (
      <Col
        className={`rule--widget rule--widget--${this.props.name.toUpperCase()}`}
        key={"widget-col-"+this.props.name}
      >
        {this.props.children}
      </Col>
    );
  }
}
