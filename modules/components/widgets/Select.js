import React, { Component, PropTypes } from 'react';
import map from 'lodash/collection/map';

export default class Select extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired
  }

  handleChange() {
    const node = React.findDOMNode(this.refs.select);
    this.props.setValue(node.value);
  }

  render() {
    const options = map(this.props.field.options, (label, value) =>
      <option key={value} value={value}>{label}</option>
    );

    return (
      <select ref="select" value={this.props.value} onChange={this.handleChange.bind(this)}>{options}</select>
    );
  }
}
