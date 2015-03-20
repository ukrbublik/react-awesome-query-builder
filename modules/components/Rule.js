import React from 'react';
import Immutable from 'immutable';
import RuleActions from '../actions/Rule';
import Values from './Values';
import Options from './Options';
import assign from 'react/lib/Object.assign';
import map from 'lodash/collection/map';
import filter from 'lodash/collection/filter';

class Rule extends React.Component {
  removeRule () {
    RuleActions.removeRule(this.props.path);
  }

  handleFieldSelect () {
    let node = React.findDOMNode(this.refs.field);
    RuleActions.setField(this.props.path, node.value);
  }

  handleOperatorSelect () {
    let node = React.findDOMNode(this.refs.operator);
    RuleActions.setOperator(this.props.path, node.value);
  }

  render () {
    let body = [];

    let fields = this.props.config.fields;
    let field = this.props.field && fields[this.props.field] || undefined;

    let operators = {};
    for (var id in this.props.config.operators) {
      if (this.props.config.operators.hasOwnProperty(id)) {
        if (field && field.operators.indexOf(id) !== -1) {
          operators[id] = this.props.config.operators[id];
        }
      }
    }

    let operator = field && this.props.operator && operators[this.props.operator] || undefined;

    if (Object.keys(fields).length) {
      let options = map(fields, (item, index) =>
        <option key={index} value={index}>{item.label}</option>
      );

      if (typeof field === 'undefined') {
        options.unshift(<option key=":empty:" value=":empty:"></option>);
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
        options.unshift(<option key=":empty:" value=":empty:"></option>);
      }

      body.push(
        <div key="operator" className="rule--operator">
          <label>Operator</label>
          <select ref="operator" value={this.props.operator || ':empty:'} onChange={this.handleOperatorSelect.bind(this)}>{options}</select>
        </div>
      );
    }

    if (field && operator) {
      let widget = typeof field.widget === 'string' ? this.props.config.widgets[field.widget] : field.widget;
      let cardinality = operator.cardinality || 1;

      let props = {
        config: this.props.config,
        path: this.props.path,
        id: this.props.id,
        field: field
      };

      body.push(<Options key="options" {...props} options={this.props.options} operator={operator} />);
      body.push(<Values key="values" {...props} value={this.props.value} cardinality={cardinality} widget={widget} />);
    }

    return (
      <div className="rule">
        <div className="rule--header">
          <div className="rule--actions">
            <a href="#" className="action action--DELETE" onClick={this.removeRule.bind(this)}>Delete</a>
          </div>
        </div>
        <div className="rule--body">{body}</div>
      </div>
    );
  }
}

Rule.propTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired
};

export default Rule;
