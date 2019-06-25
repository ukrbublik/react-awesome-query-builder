import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import { size } from 'lodash';
import {getFieldConfig} from "../../utils/configUtils";
import Immutable from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Provider, Connector, connect} from 'react-redux';


export default (Rule) => {
  class RuleContainer extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      config: PropTypes.object.isRequired,
      path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
      operator: PropTypes.string,
      field: PropTypes.string,
      actions: PropTypes.object.isRequired, //{removeRule: Funciton, setField, setOperator, setOperatorOption, setValue, setValueSrc, ...}
      onDragStart: PropTypes.func,
      value: PropTypes.any, //depends on widget
      valueSrc: PropTypes.any,
      operatorOptions: PropTypes.object,
      treeNodesCnt: PropTypes.number,
      //connected:
      //dragging: PropTypes.object, //{id, x, y, w, h}
    };

    constructor(props) {
        super(props);

        this.componentWillReceiveProps(props);
    }

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


    pureShouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    //shouldComponentUpdate = this.pureShouldComponentUpdate;
    
    shouldComponentUpdate(nextProps, nextState) {
        let prevProps = this.props;
        let prevState = this.state;

        let should = this.pureShouldComponentUpdate(nextProps, nextState);
        if (should) {
          if (prevState == nextState && prevProps != nextProps) {
            let chs = [];
            for (let k in nextProps) {
                let changed = (nextProps[k] != prevProps[k]);
                if (k == 'dragging' && (nextProps.dragging.id || prevProps.dragging.id) != nextProps.id) {
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
      const fieldConfig = getFieldConfig(this.props.field, this.props.config);
      let isGroup = fieldConfig && fieldConfig.type == '!struct';

      return (
        <div
          className={'group-or-rule-container rule-container'}
          data-id={this.props.id}
        >
          {[(
            <Rule
              key={"dragging"}
              isForDrag={true}
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
              path={this.props.path}
            />
          ), (
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
              path={this.props.path}
            />
          )]}
        </div>
      );
    }

  };


  const ConnectedRuleContainer = connect(
      (state) => {
          return {
            dragging: state.dragging,
          }
      }
  )(RuleContainer);


  return ConnectedRuleContainer;

};
