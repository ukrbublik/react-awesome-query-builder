import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Rule from "./Rule";
import Group from "./Group";
import RuleGroup from "./RuleGroup";
import RuleGroupExt from "./RuleGroupExt";
import SwitchGroup from "./SwitchGroup";
import CaseGroup from "./CaseGroup";

const types = [
  "rule",
  "group",
  "rule_group",
  "switch_group",
  "case_group"
];

const getProperties = (props) => {
  const properties = props.properties?.toObject() || {};
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
      parentFieldPathSize={props.parentFieldPathSize}
      parentReordableNodesCnt={props.parentReordableNodesCnt}
      parentFieldCanReorder={props.parentFieldCanReorder}
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
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={props.parentField}
      parentFieldPathSize={props.parentFieldPathSize}
      parentReordableNodesCnt={props.parentReordableNodesCnt}
      parentFieldCanReorder={props.parentFieldCanReorder}
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
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={props.parentField}
      parentFieldPathSize={props.parentFieldPathSize}
      parentReordableNodesCnt={props.parentReordableNodesCnt}
      parentFieldCanReorder={props.parentFieldCanReorder}
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
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={props.parentField}
      parentFieldPathSize={props.parentFieldPathSize}
      parentReordableNodesCnt={props.parentReordableNodesCnt}
      parentFieldCanReorder={props.parentFieldCanReorder}
    />
  ),
  switch_group: (props) => (
    <SwitchGroup 
      {...getProperties(props)}
      id={props.id}
      groupId={props.groupId}
      path={props.path}
      actions={props.actions}
      config={props.config}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={null}
      parentReordableNodesCnt={props.parentReordableNodesCnt}
    />
  ),
  case_group: (props) => (
    <CaseGroup 
      {...getProperties(props)}
      id={props.id}
      groupId={props.groupId}
      path={props.path}
      actions={props.actions}
      config={props.config}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      isDraggingTempo={props.isDraggingTempo}
      children1={props.children1}
      parentField={null}
      parentReordableNodesCnt={props.parentReordableNodesCnt}
    />
  ),
};


class Item extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string,
    type: PropTypes.oneOf(types).isRequired,
    path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
    properties: PropTypes.any, //instanceOf(Immutable.Map)
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
    const mode = props.properties?.get("mode");
    const postfix = mode == "array" ? "_ext" : "";    
    const renderItem = props.config.settings.renderItem;
    let Cmp = typeMap[type + postfix];
    if (renderItem) {
      return renderItem({...props, type, itemComponent: Cmp}, props.config.ctx);
    }
    if (!Cmp) return null;
    return Cmp(props);
  }
}

export { Item };
