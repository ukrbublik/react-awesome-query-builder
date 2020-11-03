import React from "react";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {RuleGroupActions} from "./RuleGroupActions";
import FieldWrapper from "../rule/FieldWrapper";
import OperatorWrapper from "../rule/OperatorWrapper";
import {useOnPropsChanged} from "../../utils/stuff";
import {ConfirmFn} from "../utils";


@GroupContainer
@Draggable("group rule_group_ext")
@ConfirmFn
class RuleGroupExt extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
    selectedField: PropTypes.string,
    parentField: PropTypes.string,
    setField: PropTypes.func,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
  }

  childrenClassName = () => "rule_group_ext--children";
  
  renderFooterWrapper = () => null;
  canAddGroup = () => false;
  canAddRule = () => true;
  canDeleteGroup = () => true;

  reordableNodesCnt() {
    const {children1} = this.props;
    return children1.size;
  }

  renderHeaderWrapper() {
    return (
      <div key="group-header" className="group--header">
        {this.renderHeader()}
        {this.renderField()}
        {this.renderOperator()}
        {this.renderActions()}
      </div>
    );
  }

  renderConjs() {
    return (
      <div className={"group--actions"}>
        {super.renderConjs()}
      </div>
    );
  }

  renderHeader() {
    return (
      <div className={"group--conjunctions"}>
        {this.renderDrag()}
      </div>
    );
  }

  renderChildrenWrapper() {
    return (
      <>
        {this.renderConjs()}
        {super.renderChildrenWrapper()}
      </>
    );
  }

  renderField() {
    const { immutableFieldsMode } = this.props.config.settings;
    return <FieldWrapper
      key="field"
      classname={"group--field"}
      config={this.props.config}
      selectedField={this.props.selectedField}
      setField={this.props.setField}
      parentField={this.props.parentField}
      readonly={immutableFieldsMode}
    />;
  }

  renderOperator() {
    const { immutableFieldsMode } = this.props.config.settings;
    const showOperator = true, showOperatorLabel = false; //
    const selectedFieldWidgetConfig = {}; //
    return <OperatorWrapper
      key="operator"
      classname={"group--operator"}
      config={this.props.config}
      selectedField={this.props.selectedField}
      selectedOperator={this.props.selectedOperator} //
      setField={this.props.setField}
      setOperator={this.props.setOperator} //
      selectedFieldPartsLabels={["group"]}
      showOperator={showOperator}
      showOperatorLabel={showOperatorLabel}
      selectedFieldWidgetConfig={selectedFieldWidgetConfig}
      readonly={immutableFieldsMode}
    />;
  }

  renderActions() {
    const {config, addRule} = this.props;

    return <RuleGroupActions
      config={config}
      addRule={addRule}
      canAddRule={this.canAddRule()}
      canDeleteGroup={this.canDeleteGroup()}
      removeSelf={this.removeSelf}
    />;
  }

  extraPropsForItem(_item) {
    return {
      parentField: this.props.selectedField
    };
  }
}


export default RuleGroupExt;
