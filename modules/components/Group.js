import React from 'react';
import Immutable from 'immutable';
import GroupActions from '../actions/Group';
import RuleActions from '../actions/Rule';
import map from 'lodash/collection/map';

class Group extends React.Component {
  setConjunction (event) {
    GroupActions.setConjunction(this.props.path, event.target.value, this.props.config);
  }

  addGroup () {
    GroupActions.addGroup(this.props.path, {
      conjunction: this.props.config.defaults.conjunction
    }, this.props.config);
  }

  removeGroup () {
    GroupActions.removeGroup(this.props.path, this.props.config);
  }

  addRule () {
    RuleActions.addRule(this.props.path, {
      value: new Immutable.List,
      options: new Immutable.Map
    }, this.props.config);
  }

  render () {
    let name = 'conjunction[' + this.props.id + ']';
    let conjunctions = map(this.props.config.conjunctions, function (item, index) {
      let checked = index == this.props.conjunction;
      let state = checked ? 'active' : 'inactive';
      let id = 'conjunction-' + this.props.id + '-' + index;

      return (
        <div key={index} className={'conjunction conjunction--' + index.toUpperCase()} data-state={state}>
          <label htmlFor={id}>{item.label}</label>
          <input id={id} type="radio" name={name} value={index} checked={checked} onChange={this.setConjunction.bind(this)} />
        </div>
      );
    }, this);

    return (
      <div className="group">
        <div className="group--header">
          <div className="group--conjunctions">{conjunctions}</div>
          <div className="group--actions">
            <a href="#" className="action action--ADD-GROUP" onClick={this.addGroup.bind(this)}>Add group</a>
            <a href="#" className="action action--ADD-RULE" onClick={this.addRule.bind(this)}>Add rule</a>
            <a href="#" className="action action--DELETE" onClick={this.removeGroup.bind(this)}>Delete</a>
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
