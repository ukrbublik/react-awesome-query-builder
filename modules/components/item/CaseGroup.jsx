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


  // renderField() {
  //   const { config, selectedField, setField, parentField, id, groupId, isLocked } = this.props;
  //   const { immutableFieldsMode } = config.settings;
  //   return <FieldWrapper
  //     key="field"
  //     classname={"rule--field"}
  //     config={config}
  //     selectedField={selectedField}
  //     setField={setField}
  //     parentField={parentField}
  //     readonly={immutableFieldsMode || isLocked}
  //     id={id}
  //     groupId={groupId}
  //   />;
  // }

  // renderOperator() {
  //   const {config, selectedField, selectedOperator, setField, setOperator, isLocked} = this.props;
  //   const { immutableFieldsMode } = config.settings;
  //   const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator) || {};
  //   const hideOperator = selectedFieldWidgetConfig.hideOperator;
  //   const showOperatorLabel = selectedField && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
  //   const showOperator = selectedField && !hideOperator;

  //   return <OperatorWrapper
  //     key="operator"
  //     classname={"group--operator"}
  //     config={config}
  //     selectedField={selectedField}
  //     selectedOperator={selectedOperator}
  //     setField={setField}
  //     setOperator={setOperator}
  //     selectedFieldPartsLabels={["group"]}
  //     showOperator={showOperator}
  //     showOperatorLabel={showOperatorLabel}
  //     selectedFieldWidgetConfig={selectedFieldWidgetConfig}
  //     readonly={immutableFieldsMode || isLocked}
  //     id={this.props.id}
  //     groupId={this.props.groupId}
  //   />;
  // }

  // renderWidget() {
  //   const {config, selectedField, selectedOperator, isLocked} = this.props;
  //   const { immutableValuesMode } = config.settings;
  //   const isFieldAndOpSelected = selectedField && selectedOperator;
  //   const showWidget = isFieldAndOpSelected;
  //   if (!showWidget) return null;

  //   const widget = <Widget
  //     key="values"
  //     isForRuleGruop={true}
  //     field={this.props.selectedField}
  //     operator={this.props.selectedOperator}
  //     value={this.props.value}
  //     valueSrc={"value"}
  //     valueError={null}
  //     config={config}
  //     setValue={!immutableValuesMode ? this.props.setValue : dummyFn}
  //     setValueSrc={dummyFn}
  //     readonly={immutableValuesMode || isLocked}
  //     id={this.props.id}
  //     groupId={this.props.groupId}
  //   />;

  //   return (
  //     <Col key={"widget-for-"+this.props.selectedOperator} className="rule--value">
  //       {widget}
  //     </Col>
  //   );
  // }

  renderActions() {
    const {config, addGroup, addRule, isLocked, isTrueLocked, id} = this.props;
    return <GroupActions
      config={config}
      addGroup={addGroup}
      addRule={addRule}
      canAddRule={this.canAddRule()}
      canAddGroup={this.canAddGroup()}
      canDeleteGroup={this.canDeleteGroup()}
      setLock={this.setLock}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      id={id}
    />;
  }

  totalRulesCnt() {
    return getTotalRulesCountInTree(this.props);
  }

  reordableNodesCnt() {
    if (this.props.isLocked)
      return 0;
    return getTotalReordableNodesCountInTree(this.props);
  }

  // extraPropsForItem(_item) {
  //   return {
  //     parentField: this.props.selectedField
  //   };
  // }
}


export default CaseGroup;
