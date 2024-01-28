import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import context from "../../stores/context";
import {pureShouldComponentUpdate} from "../../utils/reactUtils";
import {connect} from "react-redux";
import classNames from "classnames";
const {getFieldConfig} = Utils.ConfigUtils;


const createRuleContainer = (Rule) => 
  class RuleContainer extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      groupId: PropTypes.string,
      config: PropTypes.object.isRequired,
      path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
      operator: PropTypes.string,
      field: PropTypes.any,
      fieldSrc: PropTypes.string,
      fieldType: PropTypes.string,
      actions: PropTypes.object.isRequired, //{removeRule: Function, setField, setFieldSrc, setOperator, setOperatorOption, setValue, setValueSrc, ...}
      onDragStart: PropTypes.func,
      value: PropTypes.any, //depends on widget
      valueSrc: PropTypes.any,
      asyncListValues: PropTypes.array,
      valueError: PropTypes.any,
      fieldError: PropTypes.string,
      operatorOptions: PropTypes.object,
      reordableNodesCnt: PropTypes.number,
      parentField: PropTypes.string, //from RuleGroup
      isLocked: PropTypes.bool,
      isTrueLocked: PropTypes.bool,
      //connected:
      dragging: PropTypes.object, //{id, x, y, w, h}
      isDraggingTempo: PropTypes.bool,
    };

    constructor(props) {
      super(props);
      this.pureShouldComponentUpdate = pureShouldComponentUpdate(this);
      
      this.dummyFn.isDummyFn = true;
    }

    dummyFn = () => {};

    removeSelf = () => {
      this.props.actions.removeRule(this.props.path);
    };

    setLock = (lock = null) => {
      this.props.actions.setLock(this.props.path, lock);
    };

    setField = (field, asyncListValues, _meta) => {
      this.props.actions.setField(this.props.path, field, asyncListValues, _meta);
    };

    setFieldSrc = (srcKey) => {
      this.props.actions.setFieldSrc(this.props.path, srcKey);
    };

    setOperator = (operator) => {
      this.props.actions.setOperator(this.props.path, operator);
    };

    setOperatorOption = (name, value) => {
      this.props.actions.setOperatorOption(this.props.path, name, value);
    };

    setValue = (delta, value, type, asyncListValues, _meta) => {
      this.props.actions.setValue(this.props.path, delta, value, type, asyncListValues, _meta);
    };

    setValueSrc = (delta, srcKey, _meta) => {
      this.props.actions.setValueSrc(this.props.path, delta, srcKey, _meta);
    };

    // can be used for both LHS and LHS
    setFuncValue = (delta, parentFuncs, argKey, value, type, asyncListValues, _meta) => {
      this.props.actions.setFuncValue(this.props.path, delta, parentFuncs, argKey, value, type, asyncListValues, _meta);
    };

    shouldComponentUpdate(nextProps, nextState) {
      let prevProps = this.props;
      let prevState = this.state;

      let should = this.pureShouldComponentUpdate(nextProps, nextState);
      if (should) {
        if (prevState == nextState && prevProps != nextProps) {
          const draggingId = (nextProps.dragging.id || prevProps.dragging.id);
          const isDraggingMe = draggingId == nextProps.id;
          let chs = [];
          for (let k in nextProps) {
            let changed = (nextProps[k] != prevProps[k]);
            if (k == "dragging" && !isDraggingMe) {
              changed = false; //dragging another item -> ignore
            }
            if (changed) {
              chs.push(k);
            }
          }
          if (!chs.length)
            should = false;
        }
      }
      return should;
    }

    render() {
      const isDraggingMe = this.props.dragging.id == this.props.id;
      const fieldConfig = getFieldConfig(this.props.config, this.props.field);
      const fieldType = this.props.fieldType || fieldConfig?.type || null;
      const {showErrorMessage} = this.props.config.settings;
      const _isGroup = fieldConfig && fieldConfig.type == "!struct";
      const isInDraggingTempo = !isDraggingMe && this.props.isDraggingTempo;

      const {valueError, fieldError} = this.props;
      const oneValueError = [fieldError, ...(valueError?.toArray() || [])].filter(e => !!e).shift() || null;
      const hasError = oneValueError != null && showErrorMessage;

      return (
        <div
          className={classNames("group-or-rule-container", "rule-container", hasError ? "rule-with-error" : null)}
          data-id={this.props.id}
        >
          {[
            isDraggingMe ? <Rule
              key={"dragging"}
              id={this.props.id}
              groupId={this.props.groupId}
              isDraggingMe={true}
              isDraggingTempo={true}
              dragging={this.props.dragging}
              setField={this.dummyFn}
              setFieldSrc={this.dummyFn}
              setFuncValue={this.dummyFn}
              setOperator={this.dummyFn}
              setOperatorOption={this.dummyFn}
              setLock={this.dummyFn}
              removeSelf={this.dummyFn}
              setValue={this.dummyFn}
              setValueSrc={this.dummyFn}
              selectedField={this.props.field || null}
              selectedFieldSrc={this.props.fieldSrc || "field"}
              selectedFieldType={fieldType}
              parentField={this.props.parentField || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              valueType={this.props.valueType || null}
              valueError={this.props.valueError || null}
              fieldError={this.props.fieldError || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
              reordableNodesCnt={this.props.reordableNodesCnt}
              totalRulesCnt={this.props.totalRulesCnt}
              asyncListValues={this.props.asyncListValues}
              isLocked={this.props.isLocked}
              isTrueLocked={this.props.isTrueLocked}
              parentReordableNodesCnt={this.props.parentReordableNodesCnt}
            /> : null
            ,
            <Rule
              key={this.props.id}
              id={this.props.id}
              groupId={this.props.groupId}
              isDraggingMe={isDraggingMe}
              isDraggingTempo={isInDraggingTempo}
              onDragStart={this.props.onDragStart}
              setLock={isInDraggingTempo ? this.dummyFn : this.setLock}
              removeSelf={isInDraggingTempo ? this.dummyFn : this.removeSelf}
              setField={isInDraggingTempo ? this.dummyFn : this.setField}
              setFieldSrc={isInDraggingTempo ? this.dummyFn : this.setFieldSrc}
              setFuncValue={isInDraggingTempo ? this.dummyFn : this.setFuncValue}
              setOperator={isInDraggingTempo ? this.dummyFn : this.setOperator}
              setOperatorOption={isInDraggingTempo ? this.dummyFn : this.setOperatorOption}
              setValue={isInDraggingTempo ? this.dummyFn : this.setValue}
              setValueSrc={isInDraggingTempo ? this.dummyFn : this.setValueSrc}
              selectedField={this.props.field || null}
              selectedFieldSrc={this.props.fieldSrc || "field"}
              selectedFieldType={fieldType}
              parentField={this.props.parentField || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              valueType={this.props.valueType || null}
              valueError={this.props.valueError || null}
              fieldError={this.props.fieldError || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
              reordableNodesCnt={this.props.reordableNodesCnt}
              totalRulesCnt={this.props.totalRulesCnt}
              asyncListValues={this.props.asyncListValues}
              isLocked={this.props.isLocked}
              isTrueLocked={this.props.isTrueLocked}
              parentReordableNodesCnt={this.props.parentReordableNodesCnt}
            />
          ]}
        </div>
      );
    }

  };


export default (Rule) => {
  const ConnectedRuleContainer = connect(
    (state) => {
      return {
        dragging: state.dragging,
      };
    },
    null,
    null,
    {
      context
    }
  )(createRuleContainer(Rule));
  ConnectedRuleContainer.displayName = "ConnectedRuleContainer";

  return ConnectedRuleContainer;
};
