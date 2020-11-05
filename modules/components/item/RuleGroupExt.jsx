import React from "react";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {RuleGroupActions} from "./RuleGroupActions";
import FieldWrapper from "../rule/FieldWrapper";
import OperatorWrapper from "../rule/OperatorWrapper";
import {useOnPropsChanged} from "../../utils/stuff";
import {Col, dummyFn, ConfirmFn} from "../utils";
import {getFieldWidgetConfig, getFieldConfig} from "../../utils/configUtils";
import Widget from "../rule/Widget";


@GroupContainer
@Draggable("group rule_group_ext")
@ConfirmFn
class RuleGroupExt extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
    selectedField: PropTypes.string,
    selectedOperator: PropTypes.string,
    parentField: PropTypes.string,
    setField: PropTypes.func,
    setOperator: PropTypes.func,
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
        {this.renderWidget()}
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

  showNot() {
    const {config, selectedField, selectedOperator} = this.props;
    const selectedFieldConfig = getFieldConfig(selectedField, config) || {};
    return selectedFieldConfig.showNot != undefined ? selectedFieldConfig.showNot : config.settings.showNot;
  }

  conjunctionOptions() {
    const {config, selectedField, selectedOperator} = this.props;
    const selectedFieldConfig = getFieldConfig(selectedField, config) || {};
    let conjunctionOptions = super.conjunctionOptions();
    if (selectedFieldConfig.conjunctions) {
      let filtered = {};
      for (let k of selectedFieldConfig.conjunctions) {
        filtered[k] = conjunctionOptions[k];
      }
      conjunctionOptions = filtered;
    }
    return conjunctionOptions;
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
    const {config, selectedField, selectedOperator, setField, setOperator} = this.props;
    const { immutableFieldsMode } = config.settings;
    const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator) || {};
    const hideOperator = selectedFieldWidgetConfig.hideOperator;
    const showOperatorLabel = selectedField && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
    const showOperator = selectedField && !hideOperator;

    return <OperatorWrapper
      key="operator"
      classname={"group--operator"}
      config={config}
      selectedField={selectedField}
      selectedOperator={selectedOperator}
      setField={setField}
      setOperator={setOperator}
      selectedFieldPartsLabels={["group"]}
      showOperator={showOperator}
      showOperatorLabel={showOperatorLabel}
      selectedFieldWidgetConfig={selectedFieldWidgetConfig}
      readonly={immutableFieldsMode}
    />;
  }

  renderWidget() {
    const {config, selectedField, selectedOperator} = this.props;
    const { immutableValuesMode } = config.settings;
    const isFieldAndOpSelected = selectedField && selectedOperator;
    const showWidget = isFieldAndOpSelected;
    if (!showWidget) return null;

    const widget = <Widget
      key="values"
      isForRuleGruop={true}
      field={this.props.selectedField}
      operator={this.props.selectedOperator}
      value={this.props.value}
      valueSrc={"value"}
      valueError={null}
      config={config}
      setValue={!immutableValuesMode ? this.props.setValue : dummyFn}
      setValueSrc={dummyFn}
      readonly={immutableValuesMode}
    />;

    return (
      <Col key={"widget-for-"+this.props.selectedOperator} className="rule--value">
        {widget}
      </Col>
    );
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
