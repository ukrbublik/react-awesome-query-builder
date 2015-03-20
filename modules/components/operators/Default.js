import React from 'react';

class Default extends React.Component {
  render () {
    return (
      <div className="operator">
        <div className="operator--widgets">{this.props.children}</div>
      </div>
    );
  }
}

export default Default;
