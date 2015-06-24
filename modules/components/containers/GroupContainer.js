import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import Immutable from 'immutable';
import objectMapValues from 'lodash/object/mapValues';
import GroupActions from '../../actions/Group';
import RuleActions from '../../actions/Rule';

export default Group => {
  class GroupContainer extends PureComponent {
    setConjunction(conjunction) {
      GroupActions.setConjunction(this.props.path, conjunction);
    }

    removeSelf() {
      GroupActions.removeGroup(this.props.path);
    }

    addGroup() {
      GroupActions.addGroup(this.props.path, {
        conjunction: this.context.config.settings.defaultConjunction
      }, this.context.config);
    }

    addRule() {
      RuleActions.addRule(this.props.path, {
        value: Immutable.List(),
        options: Immutable.Map()
      }, this.context.config);
    }

    render() {
      const currentNesting = this.props.path.size;
      const maxNesting = this.context.config.settings.maxNesting;

      // Don't allow nesting further than the maximum configured depth and don't
      // allow removal of the root group.
      const allowFurtherNesting = typeof maxNesting === 'undefined' || currentNesting < maxNesting;
      const allowRemoval = currentNesting > 1;

      const conjunctionOptions = objectMapValues(this.context.config.conjunctions, (item, index) => ({
        id: `conjunction-${this.props.id}-${index}`,
        name: `conjunction[${this.props.id}]`,
        label: item.label,
        checked: index === this.props.conjunction,
        setConjunction: () => this.setConjunction.call(this, index)
      }), this);

      return (
        <Group id={this.props.id}
               allowRemoval={allowRemoval}
               allowFurtherNesting={allowFurtherNesting}
               conjunctionOptions={conjunctionOptions}
               removeSelf={this.removeSelf.bind(this)}
               addGroup={this.addGroup.bind(this)}
               addRule={this.addRule.bind(this)}>{this.props.children}</Group>
      );
    }
  }

  GroupContainer.contextTypes = {
    config: PropTypes.object.isRequired
  };

  return GroupContainer;
}
