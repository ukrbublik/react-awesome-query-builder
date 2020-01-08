import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import startsWith from 'lodash/startsWith'
import GroupContainer from './containers/GroupContainer';
import Draggable from './containers/Draggable';
import { Icon, Modal } from 'antd';
const { confirm } = Modal;
const classNames = require('classnames');
import Item from './Item';
import { ConjsRadios, ConjsButtons } from './Conjs';
import { Actions } from './Actions';
import { RuleResultWrapper } from './Rule';

const defaultPosition = 'topRight';


@GroupContainer
@Draggable("group")
class Group extends PureComponent {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    treeNodesCnt: PropTypes.number,
    conjunctionOptions: PropTypes.object.isRequired,
    allowFurtherNesting: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    not: PropTypes.bool,
    selectedConjunction: PropTypes.string,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    path: PropTypes.any, //instanceOf(Immutable.List)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    isDraggingMe: PropTypes.bool,
    isDraggingTempo: PropTypes.bool,
    //actions
    handleDraggerMouseDown: PropTypes.func,
    onDragStart: PropTypes.func,
    addRule: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    setConjunction: PropTypes.func.isRequired,
    setNot: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    customData: PropTypes.any,
  };

  isGroupTopPosition = () => {
    return startsWith(this.props.config.settings.groupActionsPosition || defaultPosition, 'top')
  }

  removeSelf = () => {
    const confirmOptions = this.props.config.settings.removeGroupConfirmOptions;
    const doRemove = () => {
      this.props.removeSelf();
    };
    if (confirmOptions && !this.isEmptyCurrentGroup()) {
      confirm({
        ...confirmOptions,
        onOk: doRemove,
        onCancel: null
      });
    } else {
      doRemove();
    }
  }

  isEmptyCurrentGroup = () => {
    const children = this.props.children1;
    return children.size == 0 ||
      children.size == 1 && this.isEmpty(children.first());
  }

  isEmpty = (item) => {
    return item.get("type") == "group" ? this.isEmptyGroup(item) : this.isEmptyRule(item);
  }

  isEmptyGroup = (group) => {
    const children = group.get("children1");
    return children.size == 0 ||
      children.size == 1 && this.isEmpty(children.first());
  }

  isEmptyRule = (rule) => {
    const properties = rule.get('properties');
    return !(
      properties.get("field") !== null &&
      properties.get("operator") !== null &&
      properties.get("value").filter((val) => val !== undefined).size > 0
    );
  }

  render() {
    const isGroupTopPosition = this.isGroupTopPosition();
    const { showGroupResults } = this.props.config.settings;

    return [
      <div key="group-header" className="group--header">
        {this.renderHeader()}
        {showGroupResults && this.renderRuleResult()}
        {isGroupTopPosition && this.renderActions()}
      </div>
      , this.props.children1 &&
      <div key="group-children" className={classNames(
        "group--children",
        this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--line' : ''
      )}>{this.renderChildren()}</div>
      , !isGroupTopPosition &&
      <div key="group-footer" className='group--footer'>
        {this.renderActions()}
      </div>
    ];
  }

  renderActions = () => {
    return <Actions
      config={this.props.config}
      addRule={this.props.addRule}
      addGroup={this.props.addGroup}
      allowFurtherNesting={this.props.allowFurtherNesting}
      isRoot={this.props.isRoot}
      removeSelf={this.removeSelf}
    />;
  }

  renderChildren = () => {
    const props = this.props;
    return props.children1 ? props.children1.map((item) => (
      <Item
        key={item.get('id')}
        id={item.get('id')}
        //path={props.path.push(item.get('id'))}
        path={item.get('path')}
        type={item.get('type')}
        properties={item.get('properties')}
        config={props.config}
        actions={props.actions}
        children1={item.get('children1')}
        //tree={props.tree}
        treeNodesCnt={props.treeNodesCnt}
        onDragStart={props.onDragStart}
        customData={props.customData}
      />
    )).toList() : null;
  }

  renderHeader = () => {
    const Conjs = this.props.config.settings.renderConjsAsRadios ? ConjsRadios : ConjsButtons;

    const conjs = <Conjs
      disabled={this.props.children1.size < 2}
      selectedConjunction={this.props.selectedConjunction}
      setConjunction={this.props.setConjunction}
      conjunctionOptions={this.props.conjunctionOptions}
      config={this.props.config}
      not={this.props.not}
      setNot={this.props.setNot}
    />;

    const showDragIcon = this.props.config.settings.canReorder && this.props.treeNodesCnt > 2 && !this.props.isRoot;
    const drag = showDragIcon &&
      <span
        key="group-drag-icon"
        className={"qb-drag-handler group--drag-handler"}
        onMouseDown={this.props.handleDraggerMouseDown}
      ><Icon type="bars" /> </span>;

    return (
      <div className={classNames(
        "group--conjunctions",
        // this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--conj' : ''
      )}>
        {conjs}
        {drag}
      </div>
    );
  }

  renderRuleResult = () => {
    return <RuleResultWrapper
      key="rule-result"
      ruleId={this.props.id}
      config={this.props.config}
      customData={this.props.customData}
    />
  }
}


export default Group;
