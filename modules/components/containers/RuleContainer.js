import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import size from 'lodash/size';
import {getFieldConfig} from "../../utils/index";

export default (Rule) => {
  return class RuleContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      operator: PropTypes.string,
      field: PropTypes.string
    };

    shouldComponentUpdate = shallowCompare;

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

    render() {
      const fieldConfig = getFieldConfig(this.props.field, this.props.config);
      let isGroup = fieldConfig && fieldConfig.widget == '!struct';

      return (
        <Rule
          id={this.props.id}
          removeSelf={this.removeSelf.bind(this)}
          setField={this.setField.bind(this)}
          setOperator={this.setOperator.bind(this)}
          setOperatorOption={this.setOperatorOption.bind(this)}
          setValue={this.setValue.bind(this)}
          selectedField={this.props.field || null}
          selectedOperator={this.props.operator || null}
          value={this.props.value || null}
          operatorOptions={this.props.operatorOptions}
          config={this.props.config}
        />
      );
    }
  };
};
