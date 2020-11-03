import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import WidgetContainer from "./containers/WidgetContainer";
import {Col} from "./utils";

@WidgetContainer
export default class WidgetWrapper extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
  };

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
