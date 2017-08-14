import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import Rule from './Rule';
import Group from './Group';

const typeMap = {
  rule: (props) => (
    <Rule {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      tree={props.tree}
      treeNodesCnt={props.treeNodesCnt}
      config={props.config}
      onDragStart={props.onDragStart}
      dragging={props.dragging}
    />
  ),
  group: (props) => (
    <Group {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      config={props.config}
      tree={props.tree}
      treeNodesCnt={props.treeNodesCnt}
      onDragStart={props.onDragStart}
      dragging={props.dragging}
    >
      {props.children1 ? props.children1.map((item) => (
        <Item
          key={item.get('id')}
          id={item.get('id')}
          path={props.path.push(item.get('id'))}
          type={item.get('type')}
          properties={item.get('properties')}
          config={props.config}
          actions={props.actions}
          children1={item.get('children1')}
          tree={props.tree}
          treeNodesCnt={props.treeNodesCnt}
          onDragStart={props.onDragStart}
          dragging={props.dragging}
        />
      )).toList() : null}
    </Group>
  )
};

export default class Item extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.keys(typeMap)).isRequired,
    path: PropTypes.instanceOf(Immutable.List).isRequired,
    properties: PropTypes.instanceOf(Immutable.Map).isRequired,
    children1: PropTypes.instanceOf(Immutable.OrderedMap)
  };

  shouldComponentUpdate = shallowCompare;

  render() {
    const { type, ...props } = this.props;
    return typeMap[type](props);
  }
}
