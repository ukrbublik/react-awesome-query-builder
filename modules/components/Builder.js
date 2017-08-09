import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import Item from '../components/Item';
import SortableContainer from './containers/SortableContainer';

@SortableContainer
export default class Builder extends Component {
  static propTypes = {
    tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    config: PropTypes.object.isRequired
  };
  
  render() {
    const id = this.props.tree.get('id');
    return (
      <Item key={id}
        id={id}
        path={Immutable.List.of(id)}
        type={this.props.tree.get('type')}
        properties={this.props.tree.get('properties')}
        config={this.props.config}
        actions={this.props.actions}
        dispatch={this.props.dispatch}
        children1={this.props.tree.get('children1')}
        tree={this.props.tree}
        onDragStart={this.props.onDragStart}
        dragging={this.props.dragging}
      >
      </Item>
    );
  }
}
