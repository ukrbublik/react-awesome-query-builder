import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import size from 'lodash/collection/size';
import mapValues from 'lodash/object/mapValues';
import pick from 'lodash/object/pick';
import Widget from '../Widget';
import Operator from '../Operator';

export default (Rule) => {
  return class RuleContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      operator: PropTypes.string,
      field: PropTypes.string
    };

    shouldComponentUpdate = shouldPureComponentUpdate;

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
      const { fields, operators } = this.props.config;

      let fieldOptions = mapValues(fields, (item) => item.label);

      // Add a special 'empty' option if no field has been selected yet.
      if (size(fieldOptions) && typeof this.props.field === 'undefined') {
        fieldOptions = Object.assign({}, { ':empty:': 'Select a field' }, fieldOptions);
      }

      let operatorOptions = mapValues(pick(operators, (item, index) =>
        this.props.field && fields[this.props.field] && fields[this.props.field].operators.indexOf(index) !== -1
      ), (item) => item.label);

      // Add a special 'empty' option if no operator has been selected yet.
      if (size(operatorOptions) && typeof this.props.operator === 'undefined') {
        operatorOptions = Object.assign({}, { ':empty:': 'Select an operator' }, operatorOptions);
      }

      return (
        <Rule
          id={this.props.id}
          removeSelf={this.removeSelf.bind(this)}
          setField={this.setField.bind(this)}
          setOperator={this.setOperator.bind(this)}
          selectedField={this.props.field || ':empty:'}
          selectedOperator={this.props.operator || ':empty:'}
          fieldOptions={fieldOptions}
          operatorOptions={operatorOptions}>
          {typeof this.props.field !== 'undefined' && typeof this.props.operator !== 'undefined' ? ([(
            <Operator
              key="options"
              path={this.props.path}
              field={this.props.field}
              options={this.props.operatorOptions}
              operator={this.props.operator}
              actions={this.props.actions}
              config={this.props.config} />
          ), (
            <Widget
              key="values"
              path={this.props.path}
              field={this.props.field}
              value={this.props.value}
              options={this.props.valueOptions}
              operator={this.props.operator}
              actions={this.props.actions}
              config={this.props.config} />
          )]) : null}
        </Rule>
      );
    }
  };
};
