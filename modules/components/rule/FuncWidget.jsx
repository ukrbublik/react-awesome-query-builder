import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import FuncSelect from "./FuncSelect";
import {
  getFuncConfig
} from "../../utils/configUtils";
import Widget from "./Widget";
import {Col} from "../utils";
import {setFunc, setArgValue, setArgValueSrc} from "../../utils/funcUtils";
import {useOnPropsChanged} from "../../utils/reactUtils";


export default class FuncWidget extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    operator: PropTypes.string,
    customProps: PropTypes.object,
    value: PropTypes.object, //instanceOf(Immutable.Map) //with keys 'func' and `args`
    setValue: PropTypes.func.isRequired,
    readonly: PropTypes.bool,
    parentFuncs: PropTypes.array,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForMeta = ["config", "field", "operator", "value"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getMeta({config, field, operator, value}) {
    const funcKey = value ? value.get("func") : null;
    const funcDefinition = funcKey ? getFuncConfig(config, funcKey) : null;

    return {
      funcDefinition, funcKey
    };
  }

  setFunc = (funcKey) => {
    this.props.setValue( setFunc(this.props.value, funcKey, this.props.config) );
  };

  setArgValue = (argKey, argVal) => {
    const {config} = this.props;
    const {funcDefinition} = this.meta;
    const {args} = funcDefinition;
    const argDefinition = args[argKey];

    this.props.setValue( setArgValue(this.props.value, argKey, argVal, argDefinition, config) );
  };

  setArgValueSrc = (argKey, argValSrc) => {
    const {config} = this.props;
    const {funcDefinition} = this.meta;
    const {args} = funcDefinition;
    const argDefinition = args[argKey];

    this.props.setValue( setArgValueSrc(this.props.value, argKey, argValSrc, argDefinition, config) );
  };

  renderFuncSelect = () => {
    const {config, field, operator, customProps, value, readonly, parentFuncs, id, groupId} = this.props;
    const funcKey = value ? value.get("func") : null;
    const selectProps = {
      value: funcKey,
      setValue: this.setFunc,
      config, field, operator, customProps, readonly, parentFuncs,
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
    const {config, field, operator, value, readonly, parentFuncs, id, groupId} = this.props;
    const arg = value ? value.getIn(["args", argKey]) : null;
    const argVal = arg ? arg.get("value") : undefined;
    const defaultValueSource = argDefinition.valueSources.length == 1 ? argDefinition.valueSources[0] : undefined;
    const argValSrc = arg ? (arg.get("valueSrc") || defaultValueSource || "value") : defaultValueSource;

    const widgetProps = {
      config, 
      fieldFunc: funcKey,
      fieldArg: argKey,
      leftField: field,
      operator: null,
      value: argVal,
      valueSrc: argValSrc,
      setValue: this.setArgValue,
      setValueSrc: this.setArgValueSrc,
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
    const {args} = funcDefinition;
    if (!args) return null;

    return (
      <>
        {this.renderBracketBefore(funcDefinition)}
        <Col key="args" className="rule--func--args">
          {Object.keys(args).map((argKey, argIndex) => (
            <Col key={`arg-${argKey}-${argIndex}`} className="rule--func--arg">
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
    return (
      <Col className="rule--func--wrapper">
        {this.renderFuncSelect()}
        {this.renderFuncArgs()}
      </Col>
    );
  }
}


class ArgWidget extends PureComponent {
  static propTypes = {
    funcKey: PropTypes.string.isRequired,
    argKey: PropTypes.string.isRequired,
    setValue: PropTypes.func.isRequired,
    setValueSrc: PropTypes.func.isRequired,
    readonly: PropTypes.bool,
    parentFuncs: PropTypes.array,
    id: PropTypes.string,
    groupId: PropTypes.string,
  };

  setValue = (_delta, value, _widgetType) => {
    const {setValue, argKey} = this.props;
    setValue(argKey, value);
  }

  setValueSrc = (_delta, valueSrc, _widgetType) => {
    const {setValueSrc, argKey} = this.props;
    setValueSrc(argKey, valueSrc);
  }

  render() {
    const {funcKey, parentFuncs} = this.props;
    return (
      <Widget
        {...this.props} 
        setValue={this.setValue} 
        setValueSrc={this.setValueSrc} 
        isFuncArg={true}
        parentFuncs={[...(parentFuncs || []), funcKey]}
      />
    );
  }
}
