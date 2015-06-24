import { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import range from 'lodash/utility/range';

class Proximity extends PureComponent {
  handleChange() {
    const node = React.findDOMNode(this.refs.proximity);
    this.props.setOption('proximity', node.value);
  }

  render() {
    const options = range(2, 10).map(item => <option key={item} value={item}>{item}</option>);
    const handler = this.handleChange.bind(this);
    const proximity = this.props.options.get('proximity') || this.props.defaults.proximity;

    return (
      <div className="operator--PROXIMITY">
        <div className="operator--proximity">
          <select ref="proximity" value={proximity} onChange={handler}>{options}</select>
        </div>
        <div className="operator--widgets">{this.props.children}</div>
      </div>
    );
  }
}

export default Proximity;
