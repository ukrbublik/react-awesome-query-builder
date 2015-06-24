import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import RuleContainer from './containers/RuleContainer';
import collectionMap from 'lodash/collection/map';

class Rule extends PureComponent {
  handleFieldSelect() {
    const node = React.findDOMNode(this.refs.field);
    this.props.setField(node.value);
  }

  handleOperatorSelect() {
    const node = React.findDOMNode(this.refs.operator);
    this.props.setOperator(node.value);
  }

  render() {
    const fieldOptions = collectionMap(this.props.fieldOptions, (label, value) => (
      <option key={value} value={value}>{label}</option>
    ));

    if (fieldOptions.length && typeof this.props.selectedField === 'undefined') {
      fieldOptions.unshift(<option key=":empty:" value=":empty:">Select a field</option>);
    }

    const operatorOptions = collectionMap(this.props.operatorOptions, (label, value) => (
      <option key={value} value={value}>{label}</option>
    ));

    if (operatorOptions.length && typeof this.props.selectedOperator === 'undefined') {
      operatorOptions.unshift(<option key=":empty:" value=":empty:">Select an operator</option>);
    }

    return (
      <div className="rule">
        <div className="rule--header">
          <div className="rule--actions">
            <button className="action action--DELETE" onClick={this.props.removeSelf}>Delete</button>
          </div>
        </div>
        <div className="rule--body">
          {fieldOptions.length ? (
            <div key="field" className="rule--field">
              <label>Field</label>
              <select ref="field" value={this.props.selectedField || ':empty:'} onChange={this.handleFieldSelect.bind(this)}>{fieldOptions}</select>
            </div>
          ) : null}
          {operatorOptions.length ? (
            <div key="operator" className="rule--operator">
              <label>Operator</label>
              <select ref="operator" value={this.props.selectedOperator || ':empty:'} onChange={this.handleOperatorSelect.bind(this)}>{operatorOptions}</select>
            </div>
          ) : null}
          {this.props.children}
        </div>
      </div>
    );
  }
}

Rule.propTypes = {
  fieldOptions: PropTypes.object.isRequired,
  operatorOptions: PropTypes.object.isRequired,
  setField: PropTypes.func.isRequired,
  setOperator: PropTypes.func.isRequired,
  removeSelf: PropTypes.func.isRequired,
  selectedField: PropTypes.string,
  selectedOperator: PropTypes.string
};

export default RuleContainer(Rule);
