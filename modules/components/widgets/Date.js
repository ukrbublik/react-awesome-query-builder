import React from 'react';

class Date extends React.Component {
  handleChange () {
    const node = React.findDOMNode(this.refs.date);
    this.props.setValue(node.value);
  }

  render () {
    return (
      <input type="month" ref="date" value={this.props.value} onChange={this.handleChange.bind(this)} />
    );
  }
}

export default Date;
