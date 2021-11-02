import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Rule from "./Rule";
import Group from "./Group";
import RuleGroup from "./RuleGroup";
import RuleGroupExt from "./RuleGroupExt";

const types = [
  "rule",
  "group",
  "rule_group"
];

const getProperties = (props) => {
  const properties = props.properties.toObject();
  const result = {...properties};
  if (props.isParentLocked) {
    result.isLocked = true;
  }
  if (properties.isLocked) {
    result.isTrueLocked = true;
  }
  return result;
};

const typeMap = {
  rule: (props) => (
    <Rule
      {...getProperties(props)}
      id={props.id}
      groupId={props.groupId}
      path={props.path}
      actions={props.actions}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      config={props.config}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      parentField={props.parentField}
    />
  ),
  group: (props) => (
    <Group 
      {...getProperties(props)}
      id={props.id}
      groupId={props.groupId}
      path={props.path}
      actions={props.actions}
      config={props.config}
      //tree={props.tree}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={null}
    />
  ),
  rule_group: (props) => (
    <RuleGroup 
      {...getProperties(props)}
      id={props.id}
      groupId={props.groupId}
      path={props.path}
      actions={props.actions}
      config={props.config}
      //tree={props.tree}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={props.parentField}
    />
  ),
  rule_group_ext: (props) => (
    <RuleGroupExt 
      {...getProperties(props)}
      id={props.id}
      groupId={props.groupId}
      path={props.path}
      actions={props.actions}
      config={props.config}
      //tree={props.tree}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={props.parentField}
    />
  ),
};


class Item extends PureComponent {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string,
    type: PropTypes.oneOf(types).isRequired,
    path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
    properties: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    actions: PropTypes.object.isRequired,
    reordableNodesCnt: PropTypes.number,
    onDragStart: PropTypes.func,
    parentField: PropTypes.string, //from RuleGroup
    isDraggingTempo: PropTypes.bool,
    isParentLocked: PropTypes.bool,
  };

  render() {
    const { type, ...props } = this.props;
    const mode = props.properties.get("mode");
    const postfix = mode == "array" ? "_ext" : "";
    const Cmp = typeMap[type + postfix];
    if (!Cmp) return null;
    return Cmp(props);
  }
}

export { Item };
