import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import mapValues from 'lodash/object/mapValues';

export default (Group) => {
  return class GroupContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired
    }

    shouldComponentUpdate = shouldPureComponentUpdate;

    setConjunction(conjunction) {
      this.props.actions.setConjunction(this.props.path, conjunction, this.props.config);
    }

    removeSelf() {
      this.props.actions.removeGroup(this.props.path, this.props.config);
    }

    addGroup() {
      this.props.actions.addGroup(this.props.path, this.props.config);
    }

    addRule() {
      this.props.actions.addRule(this.props.path, this.props.config);
    }

    render() {
      const currentNesting = this.props.path.size;
      const maxNesting = this.props.config.settings.maxNesting;

      // Don't allow nesting further than the maximum configured depth and don't
      // allow removal of the root group.
      const allowFurtherNesting = typeof maxNesting === 'undefined' || currentNesting < maxNesting;
      const allowRemoval = currentNesting > 1;

      const conjunctionOptions = mapValues(this.props.config.conjunctions, (item, index) => ({
        id: `conjunction-${this.props.id}-${index}`,
        name: `conjunction[${this.props.id}]`,
        label: item.label,
        checked: index === this.props.conjunction,
        setConjunction: () => this.setConjunction.call(this, index)
      }));

      return (
        <Group
          id={this.props.id}
          allowRemoval={allowRemoval}
          allowFurtherNesting={allowFurtherNesting}
          conjunctionOptions={conjunctionOptions}
          removeSelf={this.removeSelf.bind(this)}
          addGroup={this.addGroup.bind(this)}
          addRule={this.addRule.bind(this)}>{this.props.children}</Group>
      );
    }
  };
};
