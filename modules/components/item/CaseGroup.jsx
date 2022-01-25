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
@Draggable("group case_group")
@ConfirmFn
class CaseGroup extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
    // selectedField: PropTypes.string,
    // selectedOperator: PropTypes.string,
    // parentField: PropTypes.string,
    // setField: PropTypes.func,
    // setOperator: PropTypes.func,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
  }

  childrenClassName = () => "case_group--children";
  
  renderFooterWrapper = () => null;

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

  renderActions() {
    const {config, addGroup, addRule, isLocked, isTrueLocked, id} = this.props;
    return <GroupActions
      config={config}
      addGroup={addGroup}
      addRule={addRule}
      canAddRule={this.canAddRule()}
      canAddGroup={this.canAddGroup()}
      canDeleteGroup={this.canDeleteGroup()}
      removeSelf={this.removeSelf}
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


export default CaseGroup;
