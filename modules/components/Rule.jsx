import React, { Component, PureComponent } from "react";
import PropTypes from "prop-types";
import RuleContainer from "./containers/RuleContainer";
import Draggable from "./containers/Draggable";
import Field from "./Field";
import Operator from "./Operator";
import Widget from "./Widget";
import OperatorOptions from "./OperatorOptions";
import {getFieldConfig, getFieldPathLabels, getOperatorConfig, getFieldWidgetConfig} from "../utils/configUtils";
import {useOnPropsChanged} from "../utils/stuff";

const Col = ({children, ...props}) => (<div {...props}>{children}</div>);
const dummyFn = () => {};
const DragIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray" width="18px" height="18px">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);

@RuleContainer
@Draggable("rule")
class Rule extends PureComponent {
    static propTypes = {
      selectedField: PropTypes.string,
      selectedOperator: PropTypes.string,
      operatorOptions: PropTypes.object,
      config: PropTypes.object.isRequired,
      value: PropTypes.any, //depends on widget
      valueSrc: PropTypes.any,
      isDraggingMe: PropTypes.bool,
      isDraggingTempo: PropTypes.bool,
      parentField: PropTypes.string, //from RuleGroup
      valueError: PropTypes.any,
      //path: PropTypes.instanceOf(Immutable.List),
      //actions
      handleDraggerMouseDown: PropTypes.func,
      setField: PropTypes.func,
      setOperator: PropTypes.func,
      setOperatorOption: PropTypes.func,
      removeSelf: PropTypes.func,
      setValue: PropTypes.func,
      setValueSrc: PropTypes.func,
      treeNodesCnt: PropTypes.number,
    };

    constructor(props) {
      super(props);
      useOnPropsChanged(this);

      this.onPropsChanged(props);
    }

    onPropsChanged(nextProps) {
      const prevProps = this.props;
      const keysForMeta = ["selectedField", "selectedOperator", "config", "treeNodesCnt"];
      const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

      if (needUpdateMeta) {
        this.meta = this.getMeta(nextProps);
      }
    }

    getMeta({selectedField, selectedOperator, config, treeNodesCnt}) {
      const selectedFieldPartsLabels = getFieldPathLabels(selectedField, config);
      const selectedFieldConfig = getFieldConfig(selectedField, config);
      const isSelectedGroup = selectedFieldConfig && selectedFieldConfig.type == "!struct";
      const isFieldAndOpSelected = selectedField && selectedOperator && !isSelectedGroup;
      const selectedOperatorConfig = getOperatorConfig(config, selectedOperator, selectedField);
      const selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;
      const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator) || {};
      const isOnlyValue = selectedField && selectedFieldConfig.valueSources.length == 1 && selectedFieldConfig.valueSources[0] == "value";
      const hideOperator = selectedFieldWidgetConfig.hideOperator && isOnlyValue;

      const showDragIcon = config.settings.canReorder && treeNodesCnt > 1;
      const showOperator = selectedField && !hideOperator;
      const showOperatorLabel = selectedField && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
      const showWidget = isFieldAndOpSelected;
      const showOperatorOptions = isFieldAndOpSelected && selectedOperatorHasOptions;

      return {
        selectedFieldPartsLabels, selectedFieldWidgetConfig,
        showDragIcon, showOperator, showOperatorLabel, showWidget, showOperatorOptions
      };
    }

    removeSelf = () => {
      const {renderConfirm, removeRuleConfirmOptions: confirmOptions} = this.props.config.settings;
      const doRemove = () => {
        this.props.removeSelf();
      };
      if (confirmOptions && !this.isEmptyCurrentRule()) {
        renderConfirm({...confirmOptions,
          onOk: doRemove,
          onCancel: null
        });
      } else {
        doRemove();
      }
    }

    isEmptyCurrentRule = () => {
      return !(
        this.props.selectedField !== null
            && this.props.selectedOperator !== null
            && this.props.value.filter((val) => val !== undefined).size > 0
      );
    }

    render () {
      const {config, valueError} = this.props;
      const {
        selectedFieldPartsLabels, selectedFieldWidgetConfig,
        showDragIcon, showOperator, showOperatorLabel, showWidget, showOperatorOptions
      } = this.meta;
      const {
        deleteLabel, renderBeforeWidget, renderAfterWidget, renderSize, 
        immutableGroupsMode, immutableFieldsMode, immutableOpsMode, immutableValuesMode,
        renderRuleError, showErrorMessage,
        renderButton: Btn
      } = config.settings;

      const field 
            = <FieldWrapper
              key="field"
              classname={"rule--field"}
              config={config}
              selectedField={this.props.selectedField}
              setField={!immutableOpsMode ? this.props.setField : dummyFn}
              parentField={this.props.parentField}
              readonly={immutableFieldsMode}
            />;
      const operator 
            = <OperatorWrapper
              key="operator"
              config={config}
              selectedField={this.props.selectedField}
              selectedOperator={this.props.selectedOperator}
              setOperator={!immutableOpsMode ? this.props.setOperator : dummyFn}
              selectedFieldPartsLabels={selectedFieldPartsLabels}
              showOperator={showOperator}
              showOperatorLabel={showOperatorLabel}
              selectedFieldWidgetConfig={selectedFieldWidgetConfig}
              readonly={immutableOpsMode}
            />;

      const widget = showWidget
            && <Col key={"widget-for-"+this.props.selectedOperator} className="rule--value">
              <Widget
                key="values"
                field={this.props.selectedField}
                operator={this.props.selectedOperator}
                value={this.props.value}
                valueSrc={this.props.valueSrc}
                valueError={valueError}
                config={config}
                setValue={!immutableValuesMode ? this.props.setValue : dummyFn}
                setValueSrc={!immutableValuesMode ? this.props.setValueSrc : dummyFn}
                readonly={immutableValuesMode}
              />
            </Col>;
      const operatorOptions = showOperatorOptions
            && <Col key={"op-options-for-"+this.props.selectedOperator} className="rule--operator-options">
              <OperatorOptions
                key="operatorOptions"
                selectedField={this.props.selectedField}
                selectedOperator={this.props.selectedOperator}
                operatorOptions={this.props.operatorOptions}
                setOperatorOption={!immutableOpsMode ? this.props.setOperatorOption : dummyFn}
                config={config}
                readonly={immutableValuesMode}
              />
            </Col>;

      const beforeWidget = renderBeforeWidget 
            && <Col key={"before-widget-for-" +this.props.selectedOperator} className="rule--before-widget">
              {typeof renderBeforeWidget === "function" ? renderBeforeWidget(this.props) : renderBeforeWidget}
            </Col>;

      const afterWidget = renderAfterWidget 
            && <Col key={"after-widget-for-" +this.props.selectedOperator} className="rule--after-widget">
              {typeof renderAfterWidget === "function" ? renderAfterWidget(this.props) : renderAfterWidget}
            </Col>;
        
      const oneValueError = valueError && valueError.toArray().filter(e => !!e).shift() || null;
      const error = showErrorMessage && oneValueError 
            && <div className="rule--error">
              {renderRuleError ? renderRuleError({error: oneValueError}) : oneValueError}
            </div>;

      const parts = [
        field,
        operator,
        beforeWidget,
        widget,
        afterWidget,
        operatorOptions,
      ];

      const drag = showDragIcon
            && <span
              key="rule-drag-icon"
              className={"qb-drag-handler rule--drag-handler"}
              onMouseDown={this.props.handleDraggerMouseDown}
            ><DragIcon /> </span>
        ;

      const del = (
        <div key="rule-header" className="rule--header">
          {!immutableGroupsMode && <Btn 
            type="delRule" onClick={this.removeSelf} label={deleteLabel} config={config}
          />}
        </div>
      );

      const body = <div key="rule-body" className="rule--body">{parts}</div>;

      return (
        <>
          {drag}
          <div className="rule--body--wrapper">
            {body}{error}
          </div>
          {del}
        </>
      );
    }

}


export class FieldWrapper extends PureComponent {
  render() {
    const {config, selectedField, setField, parentField, classname, readonly} = this.props;
    return (
      <Col className={classname}>
        { config.settings.showLabels
                    && <label>{config.settings.fieldLabel}</label>
        }
        <Field
          config={config}
          selectedField={selectedField}
          parentField={parentField}
          setField={setField}
          customProps={config.settings.customFieldSelectProps}
          readonly={readonly}
        />
      </Col>
    );
  }
}


class OperatorWrapper extends PureComponent {
  render() {
    const {
      config, selectedField, selectedOperator, setOperator, 
      selectedFieldPartsLabels, showOperator, showOperatorLabel, selectedFieldWidgetConfig, readonly
    } = this.props;
    const operator = showOperator
            && <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
              { config.settings.showLabels
                    && <label>{config.settings.operatorLabel}</label>
              }
              <Operator
                key="operator"
                config={config}
                selectedField={selectedField}
                selectedOperator={selectedOperator}
                setOperator={setOperator}
                readonly={readonly}
              />
            </Col>;
    const hiddenOperator = showOperatorLabel
            && <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
              <div className="rule--operator">
                {config.settings.showLabels
                  ? <label>&nbsp;</label>
                  : null}
                <span>{selectedFieldWidgetConfig.operatorInlineLabel}</span>
              </div>
            </Col>;
    return [
      operator,
      hiddenOperator
    ];
  }
}

export default Rule;
