import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import size from 'lodash/size';
import Widget from '../Widget';
import Operator from '../Operator';
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

    render() {
      const fieldConfig = getFieldConfig(this.props.field, this.props.config);
      let isGroup = fieldConfig && fieldConfig.widget == '!struct';

      return (
        <Rule
          id={this.props.id}
          removeSelf={this.removeSelf.bind(this)}
          setField={this.setField.bind(this)}
          setOperator={this.setOperator.bind(this)}
          selectedField={this.props.field || null}
          selectedOperator={this.props.operator || null}
          config={this.props.config}
        >
          {!isGroup && typeof this.props.field !== 'undefined' && typeof this.props.operator !== 'undefined' ? ([(
            <Operator
              key="options"
              path={this.props.path}
              field={this.props.field}
              options={this.props.operatorOptions}
              operator={this.props.operator}
              actions={this.props.actions}
              config={this.props.config} 
            />
          ), (
            <Widget
              key="values"
              path={this.props.path}
              field={this.props.field}
              value={this.props.value}
              options={this.props.valueOptions}
              operator={this.props.operator}
              actions={this.props.actions}
              config={this.props.config} 
            />
          )]) : null}
        </Rule>
      );
    }
  };
};
