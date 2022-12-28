import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import mapValues from "lodash/mapValues";
import context from "../../stores/context";
import {pureShouldComponentUpdate, useOnPropsChanged} from "../../utils/reactUtils";
import {connect} from "react-redux";
const {defaultGroupConjunction} = Utils.DefaultUtils;


const createGroupContainer = (Group) => 
  class GroupContainer extends Component {
    static propTypes = {
      //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
      config: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired, //{setConjunction: Funciton, removeGroup, addGroup, addRule, ...}
      path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
      id: PropTypes.string.isRequired,
      groupId: PropTypes.string,
      not: PropTypes.bool,
      conjunction: PropTypes.string,
      children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
      onDragStart: PropTypes.func,
      reordableNodesCnt: PropTypes.number,
      field: PropTypes.string, // for RuleGroup
      parentField: PropTypes.string, //from RuleGroup
      isLocked: PropTypes.bool,
      isTrueLocked: PropTypes.bool,
      //connected:
      dragging: PropTypes.object, //{id, x, y, w, h}
      isDraggingTempo: PropTypes.bool,
    };

    constructor(props) {
      super(props);
      useOnPropsChanged(this);

      this.selectedConjunction = this._selectedConjunction(props);
      this.conjunctionOptions = this._getConjunctionOptions(props);
      this.dummyFn.isDummyFn = true;
    }

    shouldComponentUpdate(nextProps, nextState) {
      let prevProps = this.props;
      let prevState = this.state;

      let should = pureShouldComponentUpdate(this)(nextProps, nextState);
      if (should) {
        if (prevState == nextState && prevProps != nextProps) {
          const draggingId = (nextProps.dragging.id || prevProps.dragging.id);
          const isDraggingMe = draggingId == nextProps.id;
          let chs = [];
          for (let k in nextProps) {
            let changed = (nextProps[k] != prevProps[k]);
            if (k == "dragging" && !isDraggingMe) {
              changed = false; //dragging another item -> ignore
            }
            if (changed) {
              chs.push(k);
            }
          }
          if (!chs.length)
            should = false;
        }
      }
      return should;
    }

    onPropsChanged(nextProps) {
      const {config, id, conjunction} = nextProps;
      const oldConfig = this.props.config;
      const oldConjunction = this.props.conjunction;
      if (oldConfig != config || oldConjunction != conjunction) {
        this.selectedConjunction = this._selectedConjunction(nextProps);
        this.conjunctionOptions = this._getConjunctionOptions(nextProps);
      }
    }

    _getConjunctionOptions (props) {
      return mapValues(props.config.conjunctions, (item, index) => ({
        id: `conjunction-${props.id}-${index}`,
        name: `conjunction[${props.id}]`,
        key: index,
        label: item.label,
        checked: index === this._selectedConjunction(props),
      }));
    }

    _selectedConjunction = (props) => {
      props = props || this.props;
      return props.conjunction || defaultGroupConjunction(props.config, props.field);
    };

    setConjunction = (conj = null) => {
      this.props.actions.setConjunction(this.props.path, conj);
    };

    setNot = (not = null) => {
      this.props.actions.setNot(this.props.path, not);
    };

    setLock = (lock = null) => {
      this.props.actions.setLock(this.props.path, lock);
    };

    dummyFn = () => {};

    removeSelf = () => {
      this.props.actions.removeGroup(this.props.path);
    };

    addGroup = () => {
      this.props.actions.addGroup(this.props.path);
    };

    addCaseGroup = () => {
      this.props.actions.addCaseGroup(this.props.path);
    };

    addDefaultCaseGroup = () => {
      this.props.actions.addDefaultCaseGroup(this.props.path);
    };

    addRule = () => {
      this.props.actions.addRule(this.props.path);
    };

    // for RuleGroup
    setField = (field) => {
      this.props.actions.setField(this.props.path, field);
    };

    // for RuleGroupExt
    setOperator = (operator) => {
      this.props.actions.setOperator(this.props.path, operator);
    };

    setValue = (delta, value, type) => {
      this.props.actions.setValue(this.props.path, delta, value, type);
    };

    render() {
      const isDraggingMe = this.props.dragging.id == this.props.id;
      const currentNesting = this.props.path.size;
      const maxNesting = this.props.config.settings.maxNesting;
      const isInDraggingTempo = !isDraggingMe && this.props.isDraggingTempo;

      // Don't allow nesting further than the maximum configured depth and don't
      // allow removal of the root group.
      const allowFurtherNesting = typeof maxNesting === "undefined" || currentNesting < maxNesting;
      const isRoot = currentNesting == 1;
      return (
        <div
          className={"group-or-rule-container group-container"}
          data-id={this.props.id}
        >
          {[
            isDraggingMe ? <Group
              key={"dragging"}
              id={this.props.id}
              groupId={this.props.groupId}
              isDraggingMe={true}
              isDraggingTempo={true}
              dragging={this.props.dragging}
              isRoot={isRoot}
              allowFurtherNesting={allowFurtherNesting}
              conjunctionOptions={this.conjunctionOptions}
              not={this.props.not}
              selectedConjunction={this.selectedConjunction}
              setConjunction={this.dummyFn}
              setNot={this.dummyFn}
              setLock={this.dummyFn}
              removeSelf={this.dummyFn}
              addGroup={this.dummyFn}
              addCaseGroup={this.dummyFn}
              addDefaultCaseGroup={this.dummyFn}
              addRule={this.dummyFn}
              setField={this.dummyFn}
              setOperator={this.dummyFn}
              setValue={this.dummyFn}
              value={this.props.value || null}
              config={this.props.config}
              children1={this.props.children1}
              actions={this.props.actions}
              //tree={this.props.tree}
              reordableNodesCnt={this.props.reordableNodesCnt}
              totalRulesCnt={this.props.totalRulesCnt}
              selectedField={this.props.field || null}
              parentField={this.props.parentField || null}
              selectedOperator={this.props.operator || null}
              isLocked={this.props.isLocked}
              isTrueLocked={this.props.isTrueLocked}
              parentReordableNodesCnt={this.props.parentReordableNodesCnt}
            /> : null
            ,
            <Group
              key={this.props.id}
              id={this.props.id}
              groupId={this.props.groupId}
              isDraggingMe={isDraggingMe}
              isDraggingTempo={isInDraggingTempo}
              onDragStart={this.props.onDragStart}
              isRoot={isRoot}
              allowFurtherNesting={allowFurtherNesting}
              conjunctionOptions={this.conjunctionOptions}
              not={this.props.not}
              selectedConjunction={this.selectedConjunction}
              setConjunction={isInDraggingTempo ? this.dummyFn : this.setConjunction}
              setNot={isInDraggingTempo ? this.dummyFn : this.setNot}
              setLock={isInDraggingTempo ? this.dummyFn : this.setLock}
              removeSelf={isInDraggingTempo ? this.dummyFn : this.removeSelf}
              addGroup={isInDraggingTempo ? this.dummyFn : this.addGroup}
              addCaseGroup={isInDraggingTempo ? this.dummyFn : this.addCaseGroup}
              addDefaultCaseGroup={isInDraggingTempo ? this.dummyFn : this.addDefaultCaseGroup}
              addRule={isInDraggingTempo ? this.dummyFn : this.addRule}
              setField={isInDraggingTempo ? this.dummyFn : this.setField}
              setOperator={isInDraggingTempo ? this.dummyFn : this.setOperator}
              setValue={isInDraggingTempo ? this.dummyFn : this.setValue}
              value={this.props.value || null}
              config={this.props.config}
              children1={this.props.children1}
              actions={this.props.actions}
              //tree={this.props.tree}
              reordableNodesCnt={this.props.reordableNodesCnt}
              totalRulesCnt={this.props.totalRulesCnt}
              selectedField={this.props.field || null}
              parentField={this.props.parentField || null}
              selectedOperator={this.props.operator || null}
              isLocked={this.props.isLocked}
              isTrueLocked={this.props.isTrueLocked}
              parentReordableNodesCnt={this.props.parentReordableNodesCnt}
            />
          ]}
        </div>
      );
    }

  };


export default (Group) => {
  const ConnectedGroupContainer = connect(
    (state) => {
      return {
        dragging: state.dragging,
      };
    },
    null,
    null,
    {
      context
    }
  )(createGroupContainer(Group));
  ConnectedGroupContainer.displayName = "ConnectedGroupContainer";

  return ConnectedGroupContainer;
};
