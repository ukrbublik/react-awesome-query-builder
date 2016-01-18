import React, { Component, PropTypes } from 'react';

export default class Text extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired
  };

  handleChange() {
    let node = React.findDOMNode(this.refs.text);
    this.props.setValue(node.value);
  }

  render() {
    return (
      <input autoFocus={this.props.delta === 0} type="text" ref="text" value={this.props.value} onChange={this.handleChange.bind(this)} />
    );
  }
}
