import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import size from 'lodash/size';
import {getFieldConfig} from "../../utils/configUtils";

export default (Rule) => {
  return class RuleContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      operator: PropTypes.string,
      field: PropTypes.string,
      dragging: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.componentWillReceiveProps(props);
    }

    shouldComponentUpdate = shallowCompare;

    componentWillReceiveProps(nextProps) {
    }

    removeSelf() {
      this.props.actions.removeRule(this.props.path);
    }

    setField(field) {
      this.props.actions.setField(this.props.path, field);
    }

    setOperator(operator) {
      this.props.actions.setOperator(this.props.path, operator);
    }

    setOperatorOption(name, value) {
      this.props.actions.setOperatorOption(this.props.path, name, value);
    }

    setValue(delta, value) {
        this.props.actions.setValue(this.props.path, delta, value);
    }

    setValueSrc(delta, srcKey) {
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
              removeSelf={this.removeSelf.bind(this)}
              setField={() => {}}
              setOperator={() => {}}
              setOperatorOption={() => {}}
              removeSelf={() => {}}
              selectedField={this.props.field || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
              dragging={this.props.dragging}
              renderType={'dragging'}
            />
          ) : null, (
            <Rule
              key={this.props.id}
              id={this.props.id}
              removeSelf={this.removeSelf.bind(this)}
              setField={this.setField.bind(this)}
              setOperator={this.setOperator.bind(this)}
              setOperatorOption={this.setOperatorOption.bind(this)}
              setValue={this.setValue.bind(this)}
              setValueSrc={this.setValueSrc.bind(this)}
              selectedField={this.props.field || null}
              selectedOperator={this.props.operator || null}
              value={this.props.value || null}
              valueSrc={this.props.valueSrc || null}
              operatorOptions={this.props.operatorOptions}
              config={this.props.config}
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
