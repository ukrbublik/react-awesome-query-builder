import React, { Component } from "react";
import PropTypes from "prop-types";
import context from "../../stores/context";
import {getFieldConfig} from "../../utils/configUtils";
import {pureShouldComponentUpdate} from "../../utils/reactUtils";
import {connect} from "react-redux";
const classNames = require("classnames");


const createRuleContainer = (Rule) => 
  class RuleContainer extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      groupId: PropTypes.string,
      config: PropTypes.object.isRequired,
      path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
      operator: PropTypes.string,
      field: PropTypes.string,
      actions: PropTypes.object.isRequired, //{removeRule: Funciton, setField, setOperator, setOperatorOption, setValue, setValueSrc, ...}
      onDragStart: PropTypes.func,
      value: PropTypes.any, //depends on widget
      valueSrc: PropTypes.any,
      asyncListValues: PropTypes.array,
      valueError: PropTypes.any,
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
      
      this.dummyFn.isDummyFn = true;
    }

    dummyFn = () => {}

    removeSelf = () => {
      this.props.actions.removeRule(this.props.path);
    }

    setLock = (lock = null) => {
      this.props.actions.setLock(this.props.path, lock);
    }

    setField = (field) => {
      this.props.actions.setField(this.props.path, field);
    }

    setOperator = (operator) => {
      this.props.actions.setOperator(this.props.path, operator);
    }

    setOperatorOption = (name, value) => {
      this.props.actions.setOperatorOption(this.props.path, name, value);
    }

    setValue = (delta, value, type, asyncListValues, __isInternal) => {
      this.props.actions.setValue(this.props.path, delta, value, type, asyncListValues, __isInternal);
    }

    setValueSrc = (delta, srcKey) => {
      this.props.actions.setValueSrc(this.props.path, delta, srcKey);
    }

    shouldComponentUpdate(nextProps, nextState) {
      let prevProps = this.props;
      let prevState = this.state;

      let should = pureShouldComponentUpdate(this)(nextProps, nextState);
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
      const {showErrorMessage} = this.props.config.settings;
      const _isGroup = fieldConfig && fieldConfig.type == "!struct";
      const isInDraggingTempo = !isDraggingMe && this.props.isDraggingTempo;

      const valueError = this.props.valueError;
      const oneValueError = valueError && valueError.toArray().filter(e => !!e).shift() || null;
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
              setOperator={this.dummyFn}
              setOperatorOption={this.dummyFn}
              setLock={this.dummyFn}
              removeSelf={this.dummyFn}
              setValue={this.dummyFn}
              setValueSrc={this.dummyFn}
              selectedField={this.props.field || null}
              parentField={this.props.parentField || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              valueError={this.props.valueError || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
              reordableNodesCnt={this.props.reordableNodesCnt}
              totalRulesCnt={this.props.totalRulesCnt}
              asyncListValues={this.props.asyncListValues}
              isLocked={this.props.isLocked}
              isTrueLocked={this.props.isTrueLocked}
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
              setOperator={isInDraggingTempo ? this.dummyFn : this.setOperator}
              setOperatorOption={isInDraggingTempo ? this.dummyFn : this.setOperatorOption}
              setValue={isInDraggingTempo ? this.dummyFn : this.setValue}
              setValueSrc={isInDraggingTempo ? this.dummyFn : this.setValueSrc}
              selectedField={this.props.field || null}
              parentField={this.props.parentField || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              valueError={this.props.valueError || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
              reordableNodesCnt={this.props.reordableNodesCnt}
              totalRulesCnt={this.props.totalRulesCnt}
              asyncListValues={this.props.asyncListValues}
              isLocked={this.props.isLocked}
              isTrueLocked={this.props.isTrueLocked}
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
