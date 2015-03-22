import React from 'react';
import Immutable from 'immutable';
import GroupActions from '../actions/Group';
import RuleActions from '../actions/Rule';
import map from 'lodash/collection/map';

class Group extends React.Component {
  setConjunction (event) {
    GroupActions.setConjunction(this.context.path, event.target.value);
  }

  addGroup () {
    GroupActions.addGroup(this.context.path, {
      conjunction: this.context.config.settings.defaultConjunction
    }, this.context.config);
  }

  removeGroup () {
    GroupActions.removeGroup(this.context.path);
  }

  addRule () {
    RuleActions.addRule(this.context.path, {
      value: new Immutable.List,
      options: new Immutable.Map
    }, this.context.config);
  }

  render () {
    let name = 'conjunction[' + this.context.id + ']';
    let conjunctions = map(this.context.config.conjunctions, function (item, index) {
      let checked = index == this.props.conjunction;
      let state = checked ? 'active' : 'inactive';
      let id = 'conjunction-' + this.context.id + '-' + index;

      return (
        <div key={index} className={'conjunction conjunction--' + index.toUpperCase()} data-state={state}>
          <label htmlFor={id}>{item.label}</label>
          <input id={id} type="radio" name={name} value={index} checked={checked} onChange={this.setConjunction.bind(this)} />
        </div>
      );
    }, this);

    let depth = this.context.path.size;
    let max = this.context.config.settings.maxNesting;
    let add = typeof max === 'undefined' || depth < max ? (
      <button className="action action--ADD-GROUP" onClick={this.addGroup.bind(this)}>Add group</button>
    ) : null;

    let remove = depth > 1 ? (
      <button className="action action--DELETE" onClick={this.removeGroup.bind(this)}>Delete</button>
    ) : null;

    return (
      <div className="group">
        <div className="group--header">
          <div className="group--conjunctions">{conjunctions}</div>
          <div className="group--actions">
            {add}
            <button className="action action--ADD-RULE" onClick={this.addRule.bind(this)}>Add rule</button>
            {remove}
          </div>
        </div>
        <div className="group--children">{this.props.children}</div>
      </div>
    );
  }
}

Group.contextTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired
};

export default Group;
