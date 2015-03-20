import React from 'react';
import Immutable from 'immutable';
import GroupActions from '../actions/Group';
import RuleActions from '../actions/Rule';
import map from 'lodash/collection/map';

class Group extends React.Component {
  setConjunction (event) {
    GroupActions.setConjunction(this.props.path, event.target.value);
  }

  addGroup () {
    GroupActions.addGroup(this.props.path, {
      conjunction: this.props.config.defaults.conjunction
    });
  }

  removeGroup () {
    GroupActions.removeGroup(this.props.path);
  }

  addRule () {
    let field = this.props.config.defaults.field;

    RuleActions.addRule(this.props.path, {
      field: field,
      operator: this.props.config.fields[field].operators[0],
      value: new Immutable.List,
      options: new Immutable.Map
    });
  }

  render () {
    let name = 'conjunction[' + this.props.id + ']';
    let conjunctions = map(this.props.config.conjunctions, function (item, index) {
      let checked = index == this.props.conjunction;

      return (
        <div key={index} className={'conjunction--' + index}>
          <label>{item.label}</label>
          <input type="radio" name={name} value={index} checked={checked} onChange={this.setConjunction.bind(this)} />
        </div>
      );
    }, this);

    return (
      <div className="group">
        <div className="group--header">
          <div className="group--conjunction">{conjunctions}</div>
          <div className="group--actions">
            <a href="#" onClick={this.addGroup.bind(this)}>Add group</a>
            <a href="#" onClick={this.removeGroup.bind(this)}>Remove group</a>
            <a href="#" onClick={this.addRule.bind(this)}>Add rule</a>
          </div>
        </div>
        <div className="group--children">{this.props.children}</div>
      </div>
    );
  }
}

Group.propTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired
};

export default Group;
