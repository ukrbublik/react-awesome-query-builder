import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import size from 'lodash/size';
import {getFieldConfig} from "../../utils/configUtils";
import Immutable from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default (Rule) => {
  return class RuleContainer extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      config: PropTypes.object.isRequired,
      path: PropTypes.instanceOf(Immutable.List).isRequired,
      operator: PropTypes.string,
      field: PropTypes.string,
      actions: PropTypes.object.isRequired, //{removeRule: Funciton, setField, setOperator, setOperatorOption, setValue, setValueSrc, ...}
      dragging: PropTypes.object, //{id, x, y, w, h}
      onDragStart: PropTypes.func,
      value: PropTypes.any, //depends on widget
      valueSrc: PropTypes.any,
      operatorOptions: PropTypes.object,
      treeNodesCnt: PropTypes.number,
    };

    constructor(props) {
        super(props);

        this.componentWillReceiveProps(props);
    }

    shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    componentWillReceiveProps(nextProps) {
    }

    dummyFn = () => {}

    removeSelf = () => {
      this.props.actions.removeRule(this.props.path);
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

    setValue = (delta, value, type) => {
        this.props.actions.setValue(this.props.path, delta, value, type);
    }

    setValueSrc = (delta, srcKey) => {
        this.props.actions.setValueSrc(this.props.path, delta, srcKey);
    }


    render() {
      const fieldConfig = getFieldConfig(this.props.field, this.props.config);
      let isGroup = fieldConfig && fieldConfig.type == '!struct';

      return (
        <div
          className={'group-or-rule-container rule-container'}
          data-id={this.props.id}
        >
          {[this.props.dragging && this.props.dragging.id == this.props.id ? (
            <Rule
              key={"dragging"}
              id={this.props.id}
              setField={this.dummyFn}
              setOperator={this.dummyFn}
              setOperatorOption={this.dummyFn}
              removeSelf={this.dummyFn}
              selectedField={this.props.field || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
              treeNodesCnt={this.props.treeNodesCnt}
              dragging={this.props.dragging}
              renderType={'dragging'}
            />
          ) : null, (
            <Rule
              key={this.props.id}
              id={this.props.id}
              removeSelf={this.removeSelf}
              setField={this.setField}
              setOperator={this.setOperator}
              setOperatorOption={this.setOperatorOption}
              setValue={this.setValue}
              setValueSrc={this.setValueSrc}
              selectedField={this.props.field || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
              treeNodesCnt={this.props.treeNodesCnt}
              onDragStart={this.props.onDragStart}
              dragging={this.props.dragging}
              renderType={this.props.dragging && this.props.dragging.id == this.props.id ? 'placeholder' : null}
            />
          )]}
        </div>
      );
    }
  };
};
