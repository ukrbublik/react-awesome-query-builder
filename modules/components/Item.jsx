import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Rule from "./Rule";
import Group from "./Group";
import RuleGroup from "./RuleGroup";

const typeMap = {
  rule: (props) => (
    <Rule
      {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      config={props.config}
      onDragStart={props.onDragStart}
      parentField={props.parentField}
    />
  ),
  group: (props) => (
    <Group 
      {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      config={props.config}
      //tree={props.tree}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      children1={props.children1}
      parentField={null}
    />
  ),
  rule_group: (props) => (
    <RuleGroup 
      {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      config={props.config}
      //tree={props.tree}
      reordableNodesCnt={props.reordableNodesCnt}
      totalRulesCnt={props.totalRulesCnt}
      onDragStart={props.onDragStart}
      children1={props.children1}
      parentField={props.parentField}
    />
  )
};


class Item extends PureComponent {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.keys(typeMap)).isRequired,
    path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
    properties: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    actions: PropTypes.object.isRequired,
    reordableNodesCnt: PropTypes.number,
    onDragStart: PropTypes.func,
    parentField: PropTypes.string, //from RuleGroup
  };

  render() {
    const { type, ...props } = this.props;
    const Cmp = typeMap[type];
    if (!Cmp) return null;
    return Cmp(props);
  }
}

export default Item;
