import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import mapValues from 'lodash/mapValues';
import Immutable from 'immutable';
var stringify = require('json-stringify-safe');

export default (Group) => {
  return class GroupContainer extends Component {
    static propTypes = {
      tree: PropTypes.instanceOf(Immutable.Map).isRequired,
      config: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired, //{setConjunction: Funciton, removeGroup, addGroup, addRule, ...}
      path: PropTypes.instanceOf(Immutable.List).isRequired,
      id: PropTypes.string.isRequired,
      conjunction: PropTypes.string,
      children: PropTypes.instanceOf(Immutable.List),
      dragging: PropTypes.object, //{id, x, y, w, h}
      onDragStart: PropTypes.func,
      treeNodesCnt: PropTypes.number,
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
      const isRoot = currentNesting == 1;

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
          {[this.props.dragging && this.props.dragging.id == this.props.id ? (
            <Group
              key={"dragging"}
              id={this.props.id}
              isRoot={isRoot}
              allowFurtherNesting={allowFurtherNesting}
              conjunctionOptions={conjunctionOptions}
              selectedConjunction={this.props.conjunction}
              setConjunction={this.setConjunction.bind(this)}
              removeSelf={this.removeSelf.bind(this)}
              addGroup={this.addGroup.bind(this)}
              addRule={this.addRule.bind(this)}
              config={this.props.config}
              tree={this.props.tree}
              treeNodesCnt={this.props.treeNodesCnt}
              dragging={this.props.dragging}
              renderType={'dragging'}
            >{this.props.children}</Group>
          ) : null, (
            <Group
              key={this.props.id}
              id={this.props.id}
              isRoot={isRoot}
              allowFurtherNesting={allowFurtherNesting}
              conjunctionOptions={conjunctionOptions}
              selectedConjunction={this.props.conjunction}
              setConjunction={this.setConjunction.bind(this)}
              removeSelf={this.removeSelf.bind(this)}
              addGroup={this.addGroup.bind(this)}
              addRule={this.addRule.bind(this)}
              config={this.props.config}
              tree={this.props.tree}
              treeNodesCnt={this.props.treeNodesCnt}
              onDragStart={this.props.onDragStart}
              dragging={this.props.dragging}
              renderType={this.props.dragging && this.props.dragging.id == this.props.id ? 'placeholder' : null}
            >{this.props.children}</Group>
          )]}
        </div>
      );
    }
  };
};
