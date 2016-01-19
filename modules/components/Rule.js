import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import shouldPureComponentUpdate from 'react-pure-render/function';
import map from 'lodash/collection/map';
import size from 'lodash/collection/size';
import RuleContainer from './containers/RuleContainer';

@RuleContainer
export default class Rule extends Component {
  static propTypes = {
    fieldOptions: PropTypes.object.isRequired,
    operatorOptions: PropTypes.object.isRequired,
    setField: PropTypes.func.isRequired,
    setOperator: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    selectedField: PropTypes.string,
    selectedOperator: PropTypes.string
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  handleFieldSelect() {
    const node = ReactDOM.findDOMNode(this.refs.field);
    this.props.setField(node.value);
  }

  handleOperatorSelect() {
    const node = ReactDOM.findDOMNode(this.refs.operator);
    this.props.setOperator(node.value);
  }

  render() {
   return (
      <div className="rule">
        <div className="rule--header">
          <div className="rule--actions">
            <button className="action action--DELETE" onClick={this.props.removeSelf}>Delete</button>
          </div>
        </div>
        <div className="rule--body">
          {size(this.props.fieldOptions) ? (
            <div key="field" className="rule--field">
              <label>Field</label>
              <select ref="field" value={this.props.selectedField} onChange={this.handleFieldSelect.bind(this)}>
                {map(this.props.fieldOptions, (label, value) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ) : null}
          {size(this.props.operatorOptions) ? (
            <div key="operator" className="rule--operator">
              <label>Operator</label>
              <select ref="operator" value={this.props.selectedOperator} onChange={this.handleOperatorSelect.bind(this)}>
                {map(this.props.operatorOptions, (label, value) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ) : null}
          {this.props.children}
        </div>
      </div>
    );
  }
}
