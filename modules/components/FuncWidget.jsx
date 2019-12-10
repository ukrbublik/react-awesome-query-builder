import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import FuncSelect from './FuncSelect';import {
  getFuncConfig
} from "../utils/configUtils";
import { Col } from 'antd';
import Widget from './Widget';


const ArgWidget = ({funcKey, argKey, argDefinition, setValue, setValueSrc, ...props}) => {
  //todo: memo
  const _setValue = (d, v, wt) => {
    setValue(argKey, v)
  };
  const _setValueSrc = (d, vs, wt) => {
    setValueSrc(argKey, vs)
  };
  return <Widget {...props} setValue={_setValue} setValueSrc={_setValueSrc} isFuncArg={true} />;
};

export default class FuncWidget extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    customProps: PropTypes.object,
    value: PropTypes.shape({
      func: PropTypes.string,
      args: PropTypes.object,
    }),
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
    const {func: funcKey} = value || {};
    const funcDefinition = funcKey ? getFuncConfig(funcKey, config) : null;

    return {
      funcDefinition, funcKey
    };
  }

  setFunc = (funcKey) => {
    let value = this.props.value || {};
    value = {...value};
    value.func = funcKey;
    value.args = {};
    //todo: set default args
    this.props.setValue(value);
  };

  setArgValue = (argKey, argVal) => {
    let value = this.props.value || {};
    if (value.func) {
      value = {...value};
      let arg = value.args[argKey] || {};
      arg.value = argVal;
      value.args[argKey] = arg;
      this.props.setValue(value);
    }
  };

  setArgValueSrc = (argKey, argValSrc) => {
    let value = this.props.value || {};
    if (value.func) {
      value = {...value};
      let arg = value.args[argKey] || {};
      arg.valueSrc = argValSrc;
      delete arg.value;
      value.args[argKey] = arg;
      //this.props.setValue(value);
    }
  };

  renderFuncSelect = () => {
    const {config, field, operator, customProps, value} = this.props;
    const {func: funcKey} = value || {};
    const selectProps = {
      value: funcKey,
      setValue: this.setFunc,
      config, field, operator, customProps,
    };

    return (
      <Col key="func" className="rule--func">
        <FuncSelect {...selectProps} />
      </Col>
    );
  };

  renderArgLabel = (argKey, argDefinition) => {
    return (
      <Col className="rule--func--arg-label">
          {argDefinition.label || argKey}
      </Col>
    );
  };

//todo: owerride separators
//todo: settings showLabels

  renderArgLabelSep = (argKey, argDefinition) => {
    return (
      <Col className="rule--func--arg-label-sep">
          {":"}
      </Col>
    );
  };

  renderArgVal = (funcKey, argKey, argDefinition) => {
    const {config, field, operator, value} = this.props;
    const {args} = value || {};
    const arg = args[argKey];
    const argVal = arg ? arg.value : undefined;
    const argValSrc = arg && arg.valueSrc || 'value';
    const widgetProps = {
      config, 
      field: {func: funcKey, arg: argKey}, 
      operator: null, //todo!!! default?
      value: Immutable.List([argVal]), //todo
      valueSrc: Immutable.List([argValSrc]), //todo
      setValue: this.setArgValue,
      setValueSrc: this.setArgValueSrc,
      funcKey,
      argKey,
      argDefinition,
    };

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

  //todo: support infinite args (... [+]) ???

}
