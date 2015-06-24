import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import Immutable from 'immutable';
import RuleActions from '../../actions/Rule';
import Values from '../Values';
import Options from '../Options';
import objectMapValues from 'lodash/object/mapValues';
import objectPick from 'lodash/object/pick';

export default Rule => {
  class RuleContainer extends PureComponent {
    removeSelf() {
      RuleActions.removeRule(this.props.path);
    }

    setField(field) {
      RuleActions.setField(this.props.path, field);
    }

    setOperator(operator) {
      RuleActions.setOperator(this.props.path, operator);
    }

    render() {
      const configuredOperators = this.context.config.operators;
      const configuredFields = this.context.config.fields;
      const selectedField = this.props.field && configuredFields[this.props.field] || undefined;

      const applicableOperators = selectedField ? objectPick(configuredOperators, (item, index) => {
        return selectedField.operators.indexOf(index) !== -1;
      }) : {};

      const selectedOperator = selectedField && this.props.operator && applicableOperators[this.props.operator] || undefined;

      const fieldOptions = objectMapValues(configuredFields, (item, index) => item.label);
      const operatorOptions = objectMapValues(applicableOperators, (item, index) => item.label);

      return (
        <Rule id={this.props.id}
              setField={this.setField.bind(this)}
              setOperator={this.setOperator.bind(this)}
              selectedField={selectedField ? this.props.field : undefined}
              selectedOperator={selectedOperator ? this.props.operator : undefined}
              fieldOptions={fieldOptions}
              operatorOptions={operatorOptions}
              removeSelf={this.removeSelf.bind(this)}>
          {typeof selectedField !== 'undefined' && typeof selectedOperator !== 'undefined' ? ([(
            <Options key="options"
                     path={this.props.path}
                     field={selectedField}
                     options={this.props.options}
                     operator={selectedOperator} />
          ), (
            <Values key="values"
                    path={this.props.path}
                    field={selectedField}
                    value={this.props.value}
                    cardinality={selectedOperator.cardinality || 1}
                    widget={typeof selectedField.widget === 'string' ? this.context.config.widgets[selectedField.widget] : selectedField.widget} />
          )]) : null}
        </Rule>
      );
    }
  }

  RuleContainer.contextTypes = {
    config: PropTypes.object.isRequired
  };

  return RuleContainer;
}
