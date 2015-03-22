import React from 'react';
import Immutable from 'immutable';
import RuleActions from '../actions/Rule';
import Values from './Values';
import Options from './Options';
import map from 'lodash/collection/map';
import filter from 'lodash/collection/filter';

class Rule extends React.Component {
  removeRule () {
    RuleActions.removeRule(this.context.path);
  }

  handleFieldSelect () {
    let node = React.findDOMNode(this.refs.field);
    RuleActions.setField(this.context.path, node.value);
  }

  handleOperatorSelect () {
    let node = React.findDOMNode(this.refs.operator);
    RuleActions.setOperator(this.context.path, node.value);
  }

  render () {
    let body = [];

    let fields = this.context.config.fields;
    let field = this.props.field && fields[this.props.field] || undefined;

    let operators = {};
    for (var id in this.context.config.operators) {
      if (this.context.config.operators.hasOwnProperty(id)) {
        if (field && field.operators.indexOf(id) !== -1) {
          operators[id] = this.context.config.operators[id];
        }
      }
    }

    let operator = field && this.props.operator && operators[this.props.operator] || undefined;

    if (Object.keys(fields).length) {
      let options = map(fields, (item, index) =>
        <option key={index} value={index}>{item.label}</option>
      );

      if (typeof field === 'undefined') {
        options.unshift(<option key=":empty:" value=":empty:">Select a field</option>);
      }

      body.push(
        <div key="field" className="rule--field">
          <label>Field</label>
          <select ref="field" value={this.props.field || ':empty:'} onChange={this.handleFieldSelect.bind(this)}>{options}</select>
        </div>
      );
    }

    if (Object.keys(operators).length) {
      let options = map(operators, (item, index) =>
        <option key={index} value={index}>{item.label}</option>
      );

      if (typeof operator === 'undefined') {
        options.unshift(<option key=":empty:" value=":empty:">Select an operator</option>);
      }

      body.push(
        <div key="operator" className="rule--operator">
          <label>Operator</label>
          <select ref="operator" value={this.props.operator || ':empty:'} onChange={this.handleOperatorSelect.bind(this)}>{options}</select>
        </div>
      );
    }

    if (field && operator) {
      let widget = typeof field.widget === 'string' ? this.context.config.widgets[field.widget] : field.widget;
      let cardinality = operator.cardinality || 1;

      body.push(<Options key="options" field={field} options={this.props.options} operator={operator} />);
      body.push(<Values key="values" field={field} value={this.props.value} cardinality={cardinality} widget={widget} />);
    }

    return (
      <div className="rule">
        <div className="rule--header">
          <div className="rule--actions">
            <button className="action action--DELETE" onClick={this.removeRule.bind(this)}>Delete</button>
          </div>
        </div>
        <div className="rule--body">{body}</div>
      </div>
    );
  }
}

Rule.contextTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired
};

export default Rule;
