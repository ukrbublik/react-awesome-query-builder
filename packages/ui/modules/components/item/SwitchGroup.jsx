import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {SwitchGroupActions} from "./SwitchGroupActions";
import {Col, dummyFn, WithConfirmFn} from "../utils";
import classNames from "classnames";
const {getTotalReordableNodesCountInTree, getTotalRulesCountInTree} = Utils.TreeUtils;


class SwitchGroup extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
  };

  constructor(props) {
    super(props);
  }

  onPropsChanged(nextProps) {
    super.onPropsChanged(nextProps);
  }

  childrenClassName = () => "switch_group--children";
  
  renderFooterWrapper = () => null;
  hasDefaultCase = () => {
    return this.props.children1?.size && this.props.children1.filter(c => c.get("children1") == null).size > 0;
  };
  canAddGroup() {
    const { maxNumberOfCases } = this.props.config.settings;
    const totalCasesCnt = this.props.children1?.size || 0;
    if (maxNumberOfCases) {
      return totalCasesCnt < maxNumberOfCases;
    }
    return true;
  }
  canAddRule() {
    return false;
  }

  reordableNodesCnt() {
    // result will be passed to each case's `parentReordableNodesCnt` prop
    const totalCasesCnt = this.props.children1?.size || 0;
    let casesToReorder = totalCasesCnt;
    if (this.hasDefaultCase()) {
      casesToReorder--;
    }
    return casesToReorder;
  }

  totalRulesCntForItem(item) {
    return getTotalRulesCountInTree(item);
  }

  reordableNodesCntForItem(item) {
    if (this.props.isLocked)
      return 0;
    const { canLeaveEmptyCase, canRegroupCases } = this.props.config.settings;

    const totalCasesCnt = this.props.children1?.size || 0;
    let casesToReorder = totalCasesCnt;
    if (this.hasDefaultCase()) {
      casesToReorder--;
    }

    const nodesInCase = getTotalReordableNodesCountInTree(item);
    let cnt = nodesInCase;
    if (cnt == 1 && canRegroupCases && canLeaveEmptyCase && casesToReorder > 1)
      cnt = 111;
    return cnt;
  }

  showConjs() {
    // always show line from "If"
    return true;
  }

  renderHeaderWrapper() {
    return (
      <div key="group-header" className={classNames(
        "group--header", 
        this.isOneChild() ? "one--child" : "",
        this.isOneChild() ? "hide--line" : "",
        this.isNoChildren() ? "no--children" : "",
        this.showDragIcon() ? "with--drag" : "hide--drag",
        this.showConjs() ? "with--conjs" : "hide--conjs"
      )}>
        {this.renderHeader()}
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

  renderConjs() {
    const { config } = this.props;
    const { renderSwitchPrefix } = config.settings;
    return renderSwitchPrefix || null;
  }

  showNot() {
    return false;
  }


  renderActions() {
    const {config, addCaseGroup, addDefaultCaseGroup, isLocked, isTrueLocked, id} = this.props;

    return <SwitchGroupActions
      config={config}
      addCaseGroup={addCaseGroup}
      addDefaultCaseGroup={addDefaultCaseGroup}
      canAddDefault={!this.hasDefaultCase()}
      canAddGroup={this.canAddGroup()}
      setLock={this.setLock}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      id={id}
    />;
  }

}


export default GroupContainer(Draggable("group switch_group")(WithConfirmFn(SwitchGroup)), "switch_group");
