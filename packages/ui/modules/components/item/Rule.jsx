import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import RuleContainer from "../containers/RuleContainer";
import Draggable from "../containers/Draggable";
import OperatorWrapper from "../rule/OperatorWrapper";
import FieldWrapper from "../rule/FieldWrapper";
import Widget from "../rule/Widget";
import OperatorOptions from "../rule/OperatorOptions";
import {useOnPropsChanged} from "../../utils/reactUtils";
import {Col, DragIcon, dummyFn, WithConfirmFn} from "../utils";
import classNames from "classnames";
const {getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFieldParts} = Utils.ConfigUtils;
const {isEmptyRuleProperties} = Utils.RuleUtils;


class Rule extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string,
    selectedField: PropTypes.any,
    selectedFieldSrc: PropTypes.string,
    selectedFieldType: PropTypes.string,
    selectedOperator: PropTypes.string,
    operatorOptions: PropTypes.object,
    config: PropTypes.object.isRequired,
    value: PropTypes.any, //depends on widget
    valueSrc: PropTypes.any,
    valueType: PropTypes.any,
    asyncListValues: PropTypes.array,
    isDraggingMe: PropTypes.bool,
    isDraggingTempo: PropTypes.bool,
    parentField: PropTypes.string, //from RuleGroup
    valueError: PropTypes.any,
    isLocked: PropTypes.bool,
    isTrueLocked: PropTypes.bool,
    //path: PropTypes.instanceOf(Immutable.List),
    //actions
    handleDraggerMouseDown: PropTypes.func,
    setField: PropTypes.func,
    setFieldSrc: PropTypes.func,
    setOperator: PropTypes.func,
    setOperatorOption: PropTypes.func,
    setLock: PropTypes.func,
    removeSelf: PropTypes.func,
    setValue: PropTypes.func,
    setValueSrc: PropTypes.func,
    reordableNodesCnt: PropTypes.number,
    totalRulesCnt: PropTypes.number,
    parentReordableNodesCnt: PropTypes.number,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.removeSelf = this.removeSelf.bind(this);
    this.setLock = this.setLock.bind(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForMeta = ["selectedField", "selectedFieldSrc", "selectedFieldType", "selectedOperator", "config", "reordableNodesCnt", "isLocked"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getMeta({selectedField, selectedFieldSrc, selectedFieldType, selectedOperator, config, reordableNodesCnt, isLocked}) {
    const {keepInputOnChangeFieldSrc} = config.settings;
    const selectedFieldParts = getFieldParts(selectedField, config);
    const selectedFieldConfig = getFieldConfig(config, selectedField, selectedFieldSrc);
    const isSelectedGroup = selectedFieldConfig && selectedFieldConfig.type == "!struct";
    const isOkWithoutField = keepInputOnChangeFieldSrc && selectedFieldType;
    const isFieldSelected = !!selectedField || isOkWithoutField;
    const isFieldAndOpSelected = isFieldSelected && selectedOperator;
    const selectedOperatorConfig = getOperatorConfig(config, selectedOperator, selectedField, selectedFieldSrc);
    const selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;
    const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator, null, null, selectedFieldSrc) || {};
    const hideOperator = selectedFieldWidgetConfig.hideOperator;

    const showDragIcon = config.settings.canReorder && reordableNodesCnt > 1 && !isLocked;
    const showOperator = isFieldSelected && !hideOperator;
    const showOperatorLabel = isFieldSelected && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
    const showWidget = isFieldAndOpSelected && !isSelectedGroup;
    const showOperatorOptions = isFieldAndOpSelected && selectedOperatorHasOptions;

    return {
      selectedFieldParts, selectedFieldWidgetConfig,
      showDragIcon, showOperator, showOperatorLabel, showWidget, showOperatorOptions
    };
  }

  setLock(lock) {
    this.props.setLock(lock);
  }

  removeSelf() {
    const {confirmFn, config} = this.props;
    const {renderConfirm, removeRuleConfirmOptions: confirmOptions} = config.settings;
    const doRemove = () => {
      this.props.removeSelf();
    };
    if (confirmOptions && !this.isEmptyCurrentRule()) {
      renderConfirm.call(config.ctx, {...confirmOptions,
        onOk: doRemove,
        onCancel: null,
        confirmFn: confirmFn
      }, config.ctx);
    } else {
      doRemove();
    }
  }

  _buildWidgetProps({
    selectedField, selectedFieldSrc, selectedFieldType,
    selectedOperator, operatorOptions,
    value, valueType, valueSrc, asyncListValues, valueError,
    parentField,
  }) {
    return {
      field: selectedField,
      fieldSrc: selectedFieldSrc,
      fieldType: selectedFieldType,
      operator: selectedOperator,
      operatorOptions,
      value,
      valueType,
      valueSrc,
      asyncListValues,
      valueError,
      parentField,
    };
  }

  isEmptyCurrentRule() {
    const {config} = this.props;
    const ruleData = this._buildWidgetProps(this.props);
    return isEmptyRuleProperties(ruleData, config);
  }

  renderField() {
    const {config, isLocked, parentField} = this.props;
    const { immutableFieldsMode } = config.settings;
    // tip: don't allow function inside !group (yet)

    return <FieldWrapper
      key="field"
      classname={"rule--field"}
      config={config}
      canSelectFieldSource={!parentField}
      selectedField={this.props.selectedField}
      selectedFieldSrc={this.props.selectedFieldSrc}
      selectedFieldType={this.props.selectedFieldType}
      setField={!immutableFieldsMode ? this.props.setField : dummyFn}
      setFieldSrc={!immutableFieldsMode ? this.props.setFieldSrc : dummyFn}
      parentField={this.props.parentField}
      readonly={immutableFieldsMode || isLocked}
      id={this.props.id}
      groupId={this.props.groupId}
    />;
  }

  renderOperator () {
    const {config, isLocked} = this.props;
    const {
      selectedFieldParts, selectedFieldWidgetConfig, showOperator, showOperatorLabel
    } = this.meta;
    const { immutableOpsMode } = config.settings;
    
    return <OperatorWrapper
      key="operator"
      config={config}
      selectedField={this.props.selectedField}
      selectedFieldSrc={this.props.selectedFieldSrc}
      selectedFieldType={this.props.selectedFieldType}
      selectedOperator={this.props.selectedOperator}
      setOperator={!immutableOpsMode ? this.props.setOperator : dummyFn}
      selectedFieldParts={selectedFieldParts}
      showOperator={showOperator}
      showOperatorLabel={showOperatorLabel}
      selectedFieldWidgetConfig={selectedFieldWidgetConfig}
      readonly={immutableOpsMode || isLocked}
      id={this.props.id}
      groupId={this.props.groupId}
    />;
  }

  renderWidget() {
    const {config, isLocked} = this.props;
    const { showWidget } = this.meta;
    const { immutableValuesMode } = config.settings;
    if (!showWidget) return null;

    const widget = <Widget
      key="values"
      {...this._buildWidgetProps(this.props)}
      config={config}
      setValue={!immutableValuesMode ? this.props.setValue : dummyFn}
      setValueSrc={!immutableValuesMode ? this.props.setValueSrc : dummyFn}
      readonly={immutableValuesMode || isLocked}
      id={this.props.id}
      groupId={this.props.groupId}
    />;

    return (
      <Col key={"widget-for-"+this.props.selectedOperator} className="rule--value">
        {widget}
      </Col>
    );
  }

  renderOperatorOptions() {
    const {config} = this.props;
    const { showOperatorOptions } = this.meta;
    const { immutableOpsMode, immutableValuesMode } = config.settings;
    if (!showOperatorOptions) return null;

    const opOpts = <OperatorOptions
      key="operatorOptions"
      selectedField={this.props.selectedField}
      selectedOperator={this.props.selectedOperator}
      operatorOptions={this.props.operatorOptions}
      setOperatorOption={!immutableOpsMode ? this.props.setOperatorOption : dummyFn}
      config={config}
      readonly={immutableValuesMode}
    />;

    return (
      <Col key={"op-options-for-"+this.props.selectedOperator} className="rule--operator-options">
        {opOpts}
      </Col>
    );
  }

  renderBeforeWidget() {
    const {config} = this.props;
    const { renderBeforeWidget } = config.settings;
    return renderBeforeWidget 
        && <Col key={"before-widget-for-" +this.props.selectedOperator} className="rule--before-widget">
          {typeof renderBeforeWidget === "function" ? renderBeforeWidget(this.props, config.ctx) : renderBeforeWidget}
        </Col>;
  }

  renderAfterWidget() {
    const {config} = this.props;
    const { renderAfterWidget } = config.settings;
    return renderAfterWidget 
        && <Col key={"after-widget-for-" +this.props.selectedOperator} className="rule--after-widget">
          {typeof renderAfterWidget === "function" ? renderAfterWidget(this.props, config.ctx) : renderAfterWidget}
        </Col>;
  }

  renderError() {
    const {config, valueError} = this.props;
    const { renderRuleError, showErrorMessage } = config.settings;
    const oneValueError = valueError && valueError.toArray().filter(e => !!e).shift() || null;
    return showErrorMessage && oneValueError 
        && <div className="rule--error">
          {renderRuleError ? renderRuleError({error: oneValueError}, config.ctx) : oneValueError}
        </div>;
  }

  renderDrag() {
    const { showDragIcon } = this.meta;

    return showDragIcon
        && <span
          key="rule-drag-icon"
          className={"qb-drag-handler rule--drag-handler"}
          onMouseDown={this.props.handleDraggerMouseDown}
        ><DragIcon /> </span>;
  }

  renderDel() {
    const {config, isLocked} = this.props;
    const {
      deleteLabel, 
      immutableGroupsMode, 
      renderButton,
      canDeleteLocked
    } = config.settings;
    const Btn = (pr) => renderButton(pr, config.ctx);

    return !immutableGroupsMode && (!isLocked || isLocked && canDeleteLocked) && (
      <Btn 
        type="delRule" onClick={this.removeSelf} label={deleteLabel} config={config}
      />
    );
  }

  renderLock() {
    const {config, isLocked, isTrueLocked, id} = this.props;
    const {
      lockLabel, lockedLabel, showLock,
      renderSwitch
    } = config.settings;
    const Switch = (pr) => renderSwitch(pr, config.ctx);
      
    return showLock && !(isLocked && !isTrueLocked) && (
      <Switch 
        type="lock" id={id} value={isLocked} setValue={this.setLock} label={lockLabel} checkedLabel={lockedLabel} hideLabel={true} config={config}
      />
    );
  }

  render () {
    const { showOperatorOptions, selectedFieldWidgetConfig } = this.meta;
    const { valueSrc, value, config } = this.props;
    const canShrinkValue = valueSrc.first() == "value" && !showOperatorOptions && value.size == 1 && selectedFieldWidgetConfig.fullWidth;
    const { renderButtonGroup } = config.settings;
    const BtnGrp = (pr) => renderButtonGroup(pr, config.ctx);

    const parts = [
      this.renderField(),
      this.renderOperator(),
      this.renderBeforeWidget(),
      this.renderWidget(),
      this.renderAfterWidget(),
      this.renderOperatorOptions(),
    ];
    const body = <div key="rule-body" className={classNames("rule--body", canShrinkValue && "can--shrink--value")}>{parts}</div>;

    const error = this.renderError();
    const drag = this.renderDrag();
    const lock = this.renderLock();
    const del = this.renderDel();
      
    return (
      <>
        {drag}
        <div className="rule--body--wrapper">
          {body}{error}
        </div>
        <div className="rule--header">
          <BtnGrp config={config}>
            {lock}
            {del}
          </BtnGrp>
        </div>
      </>
    );
  }

}


export default RuleContainer(Draggable("rule")(WithConfirmFn(Rule)));
