import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import FuncSelect from './FuncSelect';import {
  getFuncConfig
} from "../utils/configUtils";
import { Col } from 'antd';
import Widget from './Widget';
import {setFunc, setArgValue, setArgValueSrc} from '../stores/tree';

// todo *must*
// 1. see "//todo: defaults"
// 2. on change field check user fields in func!!!
// 3. format!!!
// 4. config separators

export default class FuncWidget extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    customProps: PropTypes.object,
    value: PropTypes.object, //instanceOf(Immutable.Map) //with keys 'func' and `args`
    setValue: PropTypes.func.isRequired,
  };

  constructor(props) {
      super(props);

      this.componentWillReceiveProps(props);
  }

  componentWillReceiveProps(nextProps) {
      const prevProps = this.props;
      const keysForMeta = ["config", "field", "operator", "value"];
      const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

      if (needUpdateMeta) {
          this.meta = this.getMeta(nextProps);
      }
  }

  getMeta({config, field, operator, value}) {
    const funcKey = value ? value.get('func') : null;
    const funcDefinition = funcKey ? getFuncConfig(funcKey, config) : null;

    return {
      funcDefinition, funcKey
    };
  }

  setFunc = (funcKey) => {
    this.props.setValue( setFunc(this.props.value, funcKey) );
  };

  setArgValue = (argKey, argVal) => {
    this.props.setValue( setArgValue(this.props.value, argKey, argVal) );
  };

  setArgValueSrc = (argKey, argValSrc) => {
    this.props.setValue( setArgValueSrc(this.props.value, argKey, argValSrc) );
  };

  renderFuncSelect = () => {
    const {config, field, operator, customProps, value} = this.props;
    const funcKey = value ? value.get('func') : null;
    const selectProps = {
      value: funcKey,
      setValue: this.setFunc,
      config, field, operator, customProps,
    };
    const {showLabels, funcLabel} = config.settings;
    const widgetLabel = showLabels ?
        <label>{funcLabel}</label>
        : null;

    return (
      <Col key="func" className="rule--func">
        {widgetLabel}
        <FuncSelect {...selectProps} />
      </Col>
    );
  };

  renderArgLabel = (argKey, argDefinition) => {
    const {config} = this.props;
    const forceShow = argDefinition.type == 'boolean' && !config.settings.showLabels;
    if (!forceShow) return null;
    return (
      <Col className="rule--func--arg-label">
          {argDefinition.label || argKey}
      </Col>
    );
  };

  renderArgLabelSep = (argKey, argDefinition) => {
    const {config} = this.props;
    const forceShow = argDefinition.type == 'boolean' && !config.settings.showLabels;
    if (!forceShow) return null;
    return (
      <Col className="rule--func--arg-label-sep">
          {":"}
      </Col>
    );
  };

  renderArgVal = (funcKey, argKey, argDefinition) => {
    const {config, field, operator, value} = this.props;
    const arg = value ? value.getIn(['args', argKey]) : null;
    const argVal = arg ? arg.get('value') : undefined;
    const argValSrc = arg ? (arg.get('valueSrc') || 'value') : undefined;

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
    };
    //tip: value & valueSrc will be converted to Immutable.List at WidgetContainer

    return (
      <Col className="rule--func--arg-value">
          <ArgWidget {...widgetProps} />
      </Col>
    );
  };

  renderArgSep = (argKey, argDefinition, argIndex) => {
    if (!argIndex) return null;
    return (
      <Col className="rule--func--arg-sep">
        {", "}
      </Col>
    );
  };

  renderBracketBefore = (funcDefinition) => {
    return (
      <Col key="before_args" className="rule--func--bracket-before">
        {"("}
      </Col>
    );
  };

  renderBracketAfter = (funcDefinition) => {
    return (
      <Col key="after_args" className="rule--func--bracket-after">
        {")"}
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
              {this.renderArgSep(argKey, args[argKey], argIndex)}
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
    return (
      <Widget
        {...this.props} 
        setValue={this.setValue} 
        setValueSrc={this.setValueSrc} 
        isFuncArg={true}
      />
    );
  }
}
