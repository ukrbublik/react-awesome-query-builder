import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';

export default class ComplexQuery extends Component {
  static propTypes = {
    setOption: PropTypes.func.isRequired
  };

  shouldComponentUpdate = shallowCompare;

  handleOperatorSelect() {
    const node = React.findDOMNode(this.refs.operator);
    this.props.setOption('operator', node.value);
  }

  render() {
    const selectedOperator = this.props.options.get('operator');
    const operatorOptions = map(mapValues(this.props.operators, (item) => item.label), (label, value) => (
      <option key={value} value={value}>{label}</option>
    ));

    return (
      <div className="value-options--COMPLEX-QUERY">
        {operatorOptions.length ? (
          <div key="operator" className="rule--operator">
            <label>Operator</label>
            <select 
              ref="operator" 
              value={selectedOperator || ':empty:'} 
              onChange={this.handleOperatorSelect.bind(this)}
            >{operatorOptions}</select>
          </div>
        ) : null}
      </div>
    );
  }
}
