import React from 'react';

class Text extends React.Component {
  handleChange () {
    let node = React.findDOMNode(this.refs.select);
    this.props.setValue(node.value);
  }

  render () {
    let options = this.props.field.options.map((label, value) =>
      <option key={value} value={value}>{label}</option>
    );

    return (
      <div className="widget--SELECT">
        <select ref="select" value={this.props.value} onChange={this.handleChange.bind(this)}>{options}</select>
      </div>
    );
  }
}

export default Text;
