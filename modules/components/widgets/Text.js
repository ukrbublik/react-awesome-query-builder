import React, { Component, PropTypes } from 'react';

export default class Text extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired
  }

  handleChange() {
    let node = React.findDOMNode(this.refs.text);
    this.props.setValue(node.value);
  }

  render() {
    return (
      <input type="text" ref="text" value={this.props.value} onChange={this.handleChange.bind(this)} />
    );
  }
}
