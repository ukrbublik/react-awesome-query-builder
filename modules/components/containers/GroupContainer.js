import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import mapValues from 'lodash/mapValues';

var stringify = require('json-stringify-safe');

export default (Group) => {
  return class GroupContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired
    };

    shouldComponentUpdate = shallowCompare;

    setConjunction(e = null, conj = null) {
      if (!conj && e) {
        //for RadioGroup
        conj = e.target.value;
      }

      this.props.actions.setConjunction(this.props.path, conj);
    }

    removeSelf(event) {
      this.props.actions.removeGroup(this.props.path);
      event.preventDefault();
      return false;
    }

    addGroup(event) {
      this.props.actions.addGroup(this.props.path);
      event.preventDefault();
      return false;
    }

    addRule(event) {
      this.props.actions.addRule(this.props.path);
      event.preventDefault();
      return false;
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
        key: index,
        label: item.label,
        checked: index === this.props.conjunction,
      }));

      return (
        <div 
          className={'group-or-rule-container group-container'}
          data-id={this.props.id}
        >
            <Group
              id={this.props.id}
              allowRemoval={allowRemoval}
              allowFurtherNesting={allowFurtherNesting}
              conjunctionOptions={conjunctionOptions}
              selectedConjunction={this.props.conjunction}
              setConjunction={this.setConjunction.bind(this)}
              removeSelf={this.removeSelf.bind(this)}
              addGroup={this.addGroup.bind(this)}
              addRule={this.addRule.bind(this)}
              config={this.props.config}
              tree={this.props.tree}
            >{this.props.children}</Group>
        </div>
      );
    }
  };
};
