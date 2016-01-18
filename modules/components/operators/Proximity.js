import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import range from 'lodash/utility/range';

export default class Proximity extends Component {
  static propTypes = {
    setOption: PropTypes.func.isRequired
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

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
