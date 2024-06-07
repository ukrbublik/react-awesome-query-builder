import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import startsWith from "lodash/startsWith";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import classNames from "classnames";
import { Item } from "./Item";
import {GroupActions} from "./GroupActions";
import {WithConfirmFn, dummyFn, getRenderFromConfig} from "../utils";
import {useOnPropsChanged} from "../../utils/reactUtils";
const {isEmptyGroupChildren} = Utils.RuleUtils;

const defaultPosition = "topRight";


export class BasicGroup extends Component {
  static propTypes = {
    reordableNodesCnt: PropTypes.number,
    conjunctionOptions: PropTypes.object.isRequired,
    allowFurtherNesting: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    not: PropTypes.bool,
    selectedConjunction: PropTypes.string,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string,
    path: PropTypes.any, //instanceOf(Immutable.List)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    isDraggingMe: PropTypes.bool,
    isDraggingTempo: PropTypes.bool,
    isLocked: PropTypes.bool,
    isTrueLocked: PropTypes.bool,
    //actions
    handleDraggerMouseDown: PropTypes.func,
    onDragStart: PropTypes.func,
    addRule: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    setConjunction: PropTypes.func.isRequired,
    setNot: PropTypes.func.isRequired,
    setLock: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    useOnPropsChanged(this);
    this.onPropsChanged(props);

    this.removeSelf = this.removeSelf.bind(this);
    this.setLock = this.setLock.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const configChanged = !this.Icon || prevProps?.config !== nextProps?.config;

    if (configChanged) {
      const { config } = nextProps;
      const { renderIcon, renderConjs, renderBeforeActions, renderAfterActions } = config.settings;
      this.Icon = getRenderFromConfig(config, renderIcon);
      this.Conjs = getRenderFromConfig(config, renderConjs);
      this.BeforeActions = getRenderFromConfig(config, renderBeforeActions);
      this.AfterActions = getRenderFromConfig(config, renderAfterActions);
    }

    this.doRemove = () => {
      this.props.removeSelf();
    };
  }

  isGroupTopPosition() {
    return startsWith(this.props.config.settings.groupActionsPosition || defaultPosition, "top");
  }

  setLock(lock) {
    this.props.setLock(lock);
  }

  removeSelf() {
    const {confirmFn, config} = this.props;
    const {renderConfirm, removeGroupConfirmOptions: confirmOptions} = config.settings;
    if (confirmOptions && !this.isEmptyCurrentGroup()) {
      renderConfirm.call(config.ctx, {...confirmOptions,
        onOk: this.doRemove,
        onCancel: null,
        confirmFn: confirmFn
      }, config.ctx);
    } else {
      this.doRemove();
    }
  }

  isEmptyCurrentGroup() {
    const {children1, config} = this.props;
    return isEmptyGroupChildren(children1, config);
  }

  showNot() {
    const {config} = this.props;
    return config.settings.showNot;
  }

  // show conjs for 2+ children?
  showConjs() {
    const {conjunctionOptions, children1, config} = this.props;
    const conjunctionCount = Object.keys(conjunctionOptions).length;
    return conjunctionCount > 1 || this.showNot();
  }

  isNoChildren() {
    const {children1} = this.props;
    return children1 ? children1.size == 0 : true;
  }


  isOneChild() {
    const {children1} = this.props;
    return children1 ? children1.size < 2 : true;
  }

  renderChildrenWrapper() {
    const {children1} = this.props;

    return children1 && (
      <div key="group-children" className={classNames(
        "group--children",
        !this.showConjs() ? "hide--conjs" : "",
        this.isOneChild() ? "hide--line" : "",
        this.isOneChild() ? "one--child" : "",
        this.childrenClassName()
      )}>{this.renderChildren()}</div>
    );
  }

  childrenClassName = () => "";

  renderHeaderWrapper() {
    const isGroupTopPosition = this.isGroupTopPosition();
    return (
      <div key="group-header" className={classNames(
        "group--header",
        this.isOneChild() ? "one--child" : "",
        !this.showConjs() ? "hide--conjs" : "",
        this.isOneChild() ? "hide--line" : "",
        this.isNoChildren() ? "no--children" : "",
      )}>
        {this.renderHeader()}
        {isGroupTopPosition && this.renderBeforeActions()}
        {isGroupTopPosition && this.renderActions()}
        {isGroupTopPosition && this.renderAfterActions()}
      </div>
    );
  }

  renderFooterWrapper() {
    const isGroupTopPosition = this.isGroupTopPosition();
    return !isGroupTopPosition && (
      <div key="group-footer" className='group--footer'>
        {this.renderBeforeActions()}
        {this.renderActions()}
        {this.renderAfterActions()}
      </div>
    );
  }

  renderBeforeActions = () => {
    const BeforeActions = this.BeforeActions;
    if (BeforeActions == undefined)
      return null;
    return <BeforeActions
      key="group-actions-before"
      {...this.props}
    />;
  };

  renderAfterActions = () => {
    const AfterActions = this.AfterActions;
    if (AfterActions == undefined)
      return null;
    return <AfterActions
      key="group-actions-after"
      {...this.props}
    />;
  };

  renderActions() {
    const {config, addRule, addGroup, isLocked, isTrueLocked, id} = this.props;

    return <GroupActions
      key="group-actions"
      config={config}
      addRule={addRule}
      addGroup={addGroup}
      canAddGroup={this.canAddGroup()}
      canAddRule={this.canAddRule()}
      canDeleteGroup={this.canDeleteGroup()}
      removeSelf={this.removeSelf}
      setLock={this.setLock}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      id={id}
    />;
  }

  canAddGroup() {
    return this.props.allowFurtherNesting;
  }
  canAddRule() {
    const maxNumberOfRules = this.props.config.settings.maxNumberOfRules;
    const totalRulesCnt = this.props.totalRulesCnt;
    if (maxNumberOfRules) {
      return totalRulesCnt < maxNumberOfRules;
    }
    return true;
  }
  canDeleteGroup() {
    return !this.props.isRoot;
  }

  renderChildren() {
    const {children1} = this.props;
    return children1 ? children1.valueSeq().toArray().map(this.renderItem) : null;
  }

  renderItem(item) {
    if (!item) {
      return undefined;
    }
    const props = this.props;
    const {config, actions, onDragStart, isLocked} = props;
    const isRuleGroup = item.get("type") == "group" && item.getIn(["properties", "field"]) != null;
    const type = isRuleGroup ? "rule_group" : item.get("type");
    
    return (
      <Item
        {...this.extraPropsForItem(item)}
        key={item.get("id")}
        id={item.get("id")}
        groupId={props.id}
        //path={props.path.push(item.get('id'))}
        path={item.get("path")}
        type={type}
        properties={item.get("properties")}
        config={config}
        actions={actions}
        children1={item.get("children1")}
        reordableNodesCnt={this.reordableNodesCntForItem(item)}
        totalRulesCnt={this.totalRulesCntForItem(item)}
        parentReordableNodesCnt={this.reordableNodesCnt()}
        onDragStart={onDragStart}
        isDraggingTempo={this.props.isDraggingTempo}
        isParentLocked={isLocked}
      />
    );
  }

  extraPropsForItem(_item) {
    return {};
  }

  reordableNodesCnt() {
    if (this.props.isLocked)
      return 0;
    return this.props.reordableNodesCnt;
  }

  totalRulesCntForItem(_item) {
    return this.props.totalRulesCnt;
  }

  reordableNodesCntForItem(_item) {
    if (this.props.isLocked)
      return 0;
    return this.reordableNodesCnt();
  }

  showDragIcon() {
    const { config, isRoot, isLocked } = this.props;
    const reordableNodesCnt = this.reordableNodesCnt();
    return config.settings.canReorder && !isRoot && reordableNodesCnt > 1 && !isLocked;
  }

  renderDrag() {
    const { handleDraggerMouseDown } = this.props;
    const Icon = this.Icon;
    const icon = <Icon
      type="drag"
    />;
    return this.showDragIcon() && (<div 
      key="group-drag-icon"
      onMouseDown={handleDraggerMouseDown}
      className={"qb-drag-handler group--drag-handler"}
    >{icon}</div>);
  }

  conjunctionOptions() {
    const { conjunctionOptions } = this.props;
    return conjunctionOptions;
  }

  renderConjs() {
    const {
      config, children1, id,
      selectedConjunction, setConjunction, not, setNot, isLocked
    } = this.props;

    const {immutableGroupsMode, renderConjs, showNot: _showNot, notLabel} = config.settings;
    const conjunctionOptions = this.conjunctionOptions();
    if (!this.showConjs())
      return null;
    if (!children1 || !children1.size)
      return null;

    const renderProps = {
      disabled: this.isOneChild(),
      readonly: immutableGroupsMode || isLocked,
      selectedConjunction: selectedConjunction,
      setConjunction: immutableGroupsMode ? dummyFn : setConjunction,
      conjunctionOptions: conjunctionOptions,
      config: config,
      not: not || false,
      id: id,
      setNot: immutableGroupsMode ? dummyFn : setNot,
      notLabel: notLabel,
      showNot: this.showNot(),
      isLocked: isLocked
    };
    const Conjs = this.Conjs;
    return (
      <Conjs
        key="group-conjs"
        {...renderProps}
      />
    );
  }

  renderHeader() {
    return (
      <div key="group-conjunctions" className={"group--conjunctions"}>
        {this.renderConjs()}
        {this.renderDrag()}
      </div>
    );
  }

  render() {
    return <>
      {this.renderHeaderWrapper()}
      {this.renderChildrenWrapper()}
      {this.renderFooterWrapper()}
    </>;
  }
}

export default GroupContainer(Draggable("group")(WithConfirmFn(BasicGroup)), "group");
