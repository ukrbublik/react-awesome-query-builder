import React, { Component, PureComponent } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import FuncSelect from "./FuncSelect";
import Widget from "./Widget";
import {Col, getWidgetId} from "../utils";
import {useOnPropsChanged} from "../../utils/reactUtils";
const {getFuncConfig} = Utils.ConfigUtils;
const {shallowEqual} = Utils.OtherUtils;


export default class FuncWidget extends Component {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.any,
    fieldSrc: PropTypes.string,
    fieldType: PropTypes.string,
    fieldError: PropTypes.string,
    operator: PropTypes.string,
    customProps: PropTypes.object,
    value: PropTypes.object, //instanceOf(Immutable.Map) //with keys 'func' and `args`
    setValue: PropTypes.func.isRequired,
    setFuncValue: PropTypes.func,
    readonly: PropTypes.bool,
    parentFuncs: PropTypes.array,
    fieldDefinition: PropTypes.object,
    isFuncArg: PropTypes.bool,
    isLHS: PropTypes.bool,
    valueError: PropTypes.string,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForMeta = ["config", "field", "operator", "value", "fieldSrc", "fieldType", "isLHS"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k =>
      (k === "parentFuncs" ? !shallowEqual(nextProps[k], prevProps[k], true) : nextProps[k] !== prevProps[k])
    ).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getMeta({config, field, operator, value}) {
    const funcKey = value?.get?.("func") ?? null;
    const funcDefinition = funcKey ? getFuncConfig(config, funcKey) : null;

    return {
      funcDefinition, funcKey
    };
  }

  setFunc = (funcKey, _meta = {}) => {
    const { isLHS, delta, parentFuncs, id } = this.props;
    if (!_meta.widgetId) {
      const widgetId = getWidgetId({ id, isLHS, delta, parentFuncs });
      _meta.widgetId = widgetId;
    }

    this.props.setFuncValue(
      isLHS ? -1 : (delta || 0), parentFuncs, null, funcKey, "!func", undefined, _meta
    );
  };

  setArgValue = (argKey, argVal, widgetType, asyncListValues, _meta) => {
    const {config, delta, isLHS, parentFuncs} = this.props;

    this.props.setFuncValue(
      isLHS ? -1 : (delta || 0), parentFuncs, argKey, argVal, widgetType, asyncListValues, _meta
    );
  };

  setArgValueSrc = (argKey, argValSrc, _meta) => {
    const {config, delta, isLHS, parentFuncs} = this.props;

    this.props.setFuncValue(
      isLHS ? -1 : (delta || 0), parentFuncs, argKey, argValSrc, "!valueSrc", undefined, _meta
    );
  };

  renderFuncSelect = () => {
    const {config, field, fieldType, fieldSrc, isLHS, operator, customProps, value, readonly, parentFuncs, id, groupId, isFuncArg, fieldDefinition} = this.props;
    const funcKey = value?.get?.("func") ?? null;
    const selectProps = {
      value: funcKey,
      setValue: this.setFunc,
      config, field, fieldType, fieldSrc, isLHS, operator, customProps, readonly, parentFuncs, 
      isFuncArg, fieldDefinition,
      id, groupId,
    };
    const {showLabels, funcLabel} = config.settings;
    const widgetLabel = showLabels
      ? <label className="rule--label">{funcLabel}</label>
      : null;

    return (
      <Col key="func" className="rule--func">
        {widgetLabel}
        <FuncSelect {...selectProps} />
      </Col>
    );
  };

  renderArgLabel = (argKey, argDefinition) => {
    const {valueSources, type, showPrefix, label} = argDefinition;
    const {config} = this.props;
    const isConst = valueSources && valueSources.length == 1 && valueSources[0] == "const";
    const forceShow = !config.settings.showLabels && (type == "boolean" || isConst) && showPrefix;
    if (!forceShow) return null;
    return (
      <Col className="rule--func--arg-label">
        {label || argKey}
      </Col>
    );
  };

  renderArgLabelSep = (argKey, argDefinition) => {
    const {valueSources, type, showPrefix} = argDefinition;
    const {config} = this.props;
    const isConst = valueSources && valueSources.length == 1 && valueSources[0] == "const";
    const forceShow = !config.settings.showLabels && (type == "boolean" || isConst) && showPrefix;
    if (!forceShow) return null;
    return (
      <Col className="rule--func--arg-label-sep">
        {":"}
      </Col>
    );
  };

  renderArgVal = (funcKey, argKey, argDefinition) => {
    const {
      config, field, fieldType, fieldSrc, isLHS, operator, value, readonly, parentFuncs, id, groupId,
      fieldError, valueError, setFuncValue,
    } = this.props;
    const arg = value ? value.getIn(["args", argKey]) : null;
    const argVal = arg ? arg.get("value") : undefined;
    const defaultValueSource = argDefinition.valueSources.length == 1 ? argDefinition.valueSources[0] : undefined;
    const argValSrc = arg ? (arg.get("valueSrc") || defaultValueSource || "value") : defaultValueSource;

    const widgetProps = {
      config, 
      fieldFunc: funcKey,
      fieldArg: argKey,
      leftField: field,
      fieldType, // type of leftField
      fieldSrc, // src of leftField
      fieldError, // error in LHS
      valueError, // error in RHS
      isLHS,
      operator: null,
      value: argVal,
      valueSrc: argValSrc,
      setValue: this.setArgValue,
      setValueSrc: this.setArgValueSrc,
      setFuncValue,
      funcKey,
      argKey,
      argDefinition,
      readonly,
      parentFuncs,
      id,
      groupId,
    };
    //tip: value & valueSrc will be converted to Immutable.List at <Widget>

    return (
      <Col className="rule--func--arg-value">
        <ArgWidget {...widgetProps} />
      </Col>
    );
  };

  renderArgSep = (argKey, argDefinition, argIndex, {renderSeps}) => {
    if (!argIndex) return null;
    return (
      <Col className="rule--func--arg-sep">
        {renderSeps ? renderSeps[argIndex - 1] : ", "}
      </Col>
    );
  };

  renderBracketBefore = ({renderBrackets}) => {
    return (
      <Col key="before_args" className="rule--func--bracket-before">
        {renderBrackets ? renderBrackets[0] : "("}
      </Col>
    );
  };

  renderBracketAfter = ({renderBrackets}) => {
    return (
      <Col key="after_args" className="rule--func--bracket-after">
        {renderBrackets ? renderBrackets[1] : ")"}
      </Col>
    );
  };

  renderFuncArgs = () => {
    const {funcDefinition, funcKey} = this.meta;
    if (!funcKey) return null;
    const {args} = funcDefinition || {};
    if (!args) return null;

    return (
      <>
        {this.renderBracketBefore(funcDefinition)}
        <Col key={`args-${funcKey}`} className={`rule--func--args rule--func--${funcKey}--args`}>
          {Object.keys(args).map((argKey, argIndex) => (
            <Col key={`arg-${argKey}-${argIndex}`} className={`rule--func--arg rule--func--${funcKey}--arg--${argKey}`}>
              {this.renderArgSep(argKey, args[argKey], argIndex, funcDefinition)}
              {this.renderArgLabel(argKey, args[argKey])}
              {this.renderArgLabelSep(argKey, args[argKey])}
              {this.renderArgVal(funcKey, argKey, args[argKey])}
            </Col>
          ))}
        </Col>
        {this.renderBracketAfter(funcDefinition)}
      </>
    );
  };

  render() {
    const { parentFuncs } = this.props;
    const funcPath = parentFuncs ? parentFuncs.map(([f, a]) => `${f}_${a}`).join("-") : "root";
    const funcLevel = parentFuncs?.length || 0;
    return (
      <Col className={`rule--func--wrapper rule--func--wrapper--under-${funcPath} rule--func--wrapper--lev-${funcLevel}`}>
        {this.renderFuncSelect()}
        {this.renderFuncArgs()}
      </Col>
    );
  }
}


class ArgWidget extends Component {
  static propTypes = {
    funcKey: PropTypes.string.isRequired,
    argKey: PropTypes.string.isRequired,
    setValue: PropTypes.func.isRequired,
    setValueSrc: PropTypes.func.isRequired,
    readonly: PropTypes.bool,
    isLHS: PropTypes.bool,
    parentFuncs: PropTypes.array,
    id: PropTypes.string,
    groupId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForMeta = ["parentFuncs", "funcKey", "argKey"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k =>
      (k === "parentFuncs" ? !shallowEqual(nextProps[k], prevProps[k], true) : nextProps[k] !== prevProps[k])
    ).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getMeta({parentFuncs, funcKey, argKey}) {
    const newParentFuncs = [...(parentFuncs || []), [funcKey, argKey]];

    return {
      parentFuncs: newParentFuncs
    };
  }

  setValue = (_delta, value, widgetType, asyncListValues, _meta) => {
    const {setValue, argKey} = this.props;
    setValue(argKey, value, widgetType, asyncListValues, _meta);
  };

  setValueSrc = (_delta, valueSrc, _meta) => {
    const {setValueSrc, argKey} = this.props;
    setValueSrc(argKey, valueSrc, _meta);
  };

  render() {
    const {parentFuncs} = this.meta;
    return (
      <Widget
        {...this.props}
        setValue={this.setValue}
        setValueSrc={this.setValueSrc}
        isFuncArg={true}
        parentFuncs={parentFuncs}
      />
    );
  }
}
