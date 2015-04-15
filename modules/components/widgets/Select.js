import React from 'react';
import map from 'lodash/collection/map';

class Select extends React.Component {
  handleChange () {
    let node = React.findDOMNode(this.refs.select);
    this.props.setValue(node.value);
  }

  render () {
    let options = map(this.props.field.options, (label, value) =>
      <option key={value} value={value}>{label}</option>
    );

    return (
      <select ref="select" value={this.props.value} onChange={this.handleChange.bind(this)}>{options}</select>
    );
  }
}

export default Select;
