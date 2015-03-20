import React from 'react';
import Immutable from 'immutable';
import RuleActions from '../actions/Rule';
import Filter from './Filter';
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
    let config = this.props.config;
    let field = (this.props.field && config.fields[this.props.field]) || config.fields[Object.keys(config.fields)[0]];
    let widget = config.widgets[field.widget];
    let operator = config.operators[this.props.operator || field.operators[0]];
    let operators = filter(config.operators,
      (value, key) => field.operators.indexOf(key) >= 0
    );

    let fieldOptions = map(this.props.config.fields, (item, index) =>
      <option key={index} value={index}>{item.label}</option>
    );

    let operatorOptions = map(operators, (item, index) =>
      <option key={index} value={index}>{item.label}</option>
    );

    return (
      <div className="rule">
        <div className="rule--header">
          <div className="rule--actions"><a href="#" onClick={this.removeRule.bind(this)}>Remove rule</a></div>
        </div>
        <div className="rule--body">
          <div className="rule--fields">
            <select ref="field" value={this.props.field} onChange={this.handleFieldSelect.bind(this)}>{fieldOptions}</select>
          </div>
          <div className="rule--operator">
            <select ref="operator" value={this.props.operator} onChange={this.handleOperatorSelect.bind(this)}>{operatorOptions}</select>
          </div>
          <div className="rule--filter">
            <Filter path={this.props.path} value={this.props.value} options={this.props.options} field={field} operator={operator} widget={widget} />
          </div>
        </div>
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
