import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import map from 'lodash/collection/map';
import mapValues from 'lodash/object/mapValues';

export default class ComplexQuery extends Component {
  static propTypes = {
    setOption: PropTypes.func.isRequired
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  handleOperatorSelect() {
    const node = React.findDOMNode(this.refs.operator);
    this.props.setOption('operator', node.value);
  }

  render() {
    const selectedOperator = this.props.options.get('operator');
    const operatorOptions = map(mapValues(this.props.operators, (item) => item.label), (label, value) => (
      <option key={value} value={value}>{label}</option>
    ));

    if (operatorOptions.length && typeof selectedOperator === 'undefined') {
      operatorOptions.unshift(<option key=":empty:" value=":empty:">Select an operator</option>);
    }

    return (
      <div className="value-options--COMPLEX-QUERY">
        {operatorOptions.length ? (
          <div key="operator" className="rule--operator">
            <label>Operator</label>
            <select ref="operator" value={selectedOperator || ':empty:'} onChange={this.handleOperatorSelect.bind(this)}>{operatorOptions}</select>
          </div>
        ) : null}
      </div>
    );
  }
}
