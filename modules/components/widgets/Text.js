import React from 'react';

class Text extends React.Component {
  handleChange () {
    let node = React.findDOMNode(this.refs.text);
    this.props.setValue(node.value);
  }

  render () {
    return (
      <input type="text" ref="text" value={this.props.value} onChange={this.handleChange.bind(this)} />
    );
  }
}

export default Text;
