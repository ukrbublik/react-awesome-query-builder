import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';

export default class Proximity extends Component {
  static propTypes = {
    setOption: PropTypes.func.isRequired
  };

  shouldComponentUpdate = shallowCompare;

  handleChange() {
    const node = React.findDOMNode(this.refs.proximity);
    this.props.setOption('proximity', node.value);
  }

  render() {
    const selectedProximity = this.props.options.get('proximity', this.props.defaults.proximity);

    return (
      <div className="operator--PROXIMITY">
        <div className="operator--proximity">
          <select ref="proximity" value={selectedProximity} onChange={this.handleChange.bind(this)}>
            {range(this.props.minProximity || 2, (this.props.maxProximity || 10) + 1).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="operator--widgets">{this.props.children}</div>
      </div>
    );
  }
}
