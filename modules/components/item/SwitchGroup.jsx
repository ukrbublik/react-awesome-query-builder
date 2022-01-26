import React from "react";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {GroupActions} from "./GroupActions";
import FieldWrapper from "../rule/FieldWrapper";
import OperatorWrapper from "../rule/OperatorWrapper";
import {useOnPropsChanged} from "../../utils/reactUtils";
import {Col, dummyFn, ConfirmFn} from "../utils";
import {getFieldWidgetConfig, getFieldConfig} from "../../utils/configUtils";
import Widget from "../rule/Widget";
import {getTotalReordableNodesCountInTree, getTotalRulesCountInTree} from "../../utils/treeUtils";
const classNames = require("classnames");


@GroupContainer
@Draggable("group switch_group")
@ConfirmFn
class SwitchGroup extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
  }

  childrenClassName = () => "switch_group--children";
  
  renderFooterWrapper = () => null;
  canAddGroup = () => {
    const { maxNumberOfCases } = this.props.config.settings;
    const totalCasesCnt = this.props.children1.size;
    if (maxNumberOfCases) {
      return totalCasesCnt < maxNumberOfCases;
    }
    return true;
  }
  canAddRule = () => false;
  canDeleteGroup = () => false;

  reordableNodesCnt() {
    const totalCasesCnt = this.props.children1.size;
    //todo: -1 for default
    return totalCasesCnt;
  }

  totalRulesCntForItem(item) {
    return getTotalRulesCountInTree(item);
  }

  reordableNodesCntForItem(item) {
    if (this.props.isLocked)
      return 0;
    const { canLeaveEmptyCase } = this.props.config.settings;
    const totalCasesCnt = this.props.children1.size;
    const cnt = getTotalReordableNodesCountInTree(item);
    return cnt == 1 && canLeaveEmptyCase && totalCasesCnt > 1 ? 111 : cnt;
  }

  renderHeaderWrapper() {
    return (
      <div key="group-header" className={classNames(
        "group--header", 
        this.isOneChild() ? "one--child" : "",
        this.showDragIcon() ? "with--drag" : "hide--drag",
        this.showConjs() && (!this.isOneChild() || this.showNot()) ? "with--conjs" : "hide--conjs"
      )}>
        {this.renderHeader()}
        {this.renderGroupField()}
        {this.renderActions()}
      </div>
    );
  }

  renderHeader() {
    return (
      <div className={"group--conjunctions"}>
        {this.renderConjs()}
        {this.renderDrag()}
      </div>
    );
  }

  renderGroupField() {
    return (
      <div className={"group--field--count--rule"}>
        {/* {this.renderField()}
        {this.renderOperator()}
        {this.renderWidget()} */}
      </div>
    );
  }

  renderConjs() {
    return "switch";
  }

  showNot() {
    return false;
  }


  renderActions() {
    const {config, addCaseGroup, isLocked, isTrueLocked, id} = this.props;

    return <GroupActions
      config={config}
      addGroup={addCaseGroup}
      canAddRule={this.canAddRule()}
      canAddGroup={this.canAddGroup()}
      canDeleteGroup={this.canDeleteGroup()}
      setLock={this.setLock}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      id={id}
    />;
  }


  // extraPropsForItem(_item) {
  //   return {
  //     parentField: this.props.selectedField
  //   };
  // }
}


export default SwitchGroup;
