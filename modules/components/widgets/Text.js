import React from 'react';

class Text extends React.Component {
  handleChange () {
    let node = React.findDOMNode(this.refs.text);
    this.props.setValue(node.value);
  }

  render () {
    return (
      <div className="widget--TEXT">
        <input type="textfield" ref="text" value={this.props.value} onChange={this.handleChange.bind(this)} />
      </div>
    );
  }
}

export default Text;
