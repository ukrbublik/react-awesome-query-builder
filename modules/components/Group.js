import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import map from 'lodash/map';
import GroupContainer from './containers/GroupContainer';

@GroupContainer
export default class Group extends Component {
  static propTypes = {
    conjunctionOptions: PropTypes.object.isRequired,
    addRule: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    allowFurtherNesting: PropTypes.bool.isRequired,
    allowRemoval: PropTypes.bool.isRequired
  };

  shouldComponentUpdate = shallowCompare;

  render() {
    return (
      <div className="group">
        <div className="group--header">
          <div className="group--conjunctions">
            {map(this.props.conjunctionOptions, (item, index) => (
              <div key={index} className={`conjunction conjunction--${index.toUpperCase()}`} data-state={item.checked ? 'active' : 'inactive'}>
                <label htmlFor={item.id}>{item.label}</label>
                <input id={item.id} type="radio"name={item.name} value={index} checked={item.checked} onChange={item.setConjunction} />
              </div>
            ))}
          </div>
          <div className="group--actions">
            {this.props.allowFurtherNesting ? (
              <button className="action action--ADD-GROUP" onClick={this.props.addGroup}>{this.props.config.settings.addGroupLabel || "Add group"}</button>
            ) : null}
            <button className="action action--ADD-RULE" onClick={this.props.addRule}>{this.props.config.settings.addRuleLabel || "Add rule"}</button>
            {this.props.allowRemoval ? (
              <button className="action action--DELETE" onClick={this.props.removeSelf}>{this.props.config.settings.delGroupLabel || "Delete"}</button>
            ) : null}
          </div>
        </div>
        {this.props.children ? (
          <div className="group--children">{this.props.children}</div>
        ) : null}
      </div>
    );
  }
}
