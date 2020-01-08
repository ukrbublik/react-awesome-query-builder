import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class RuleResult extends PureComponent {
  static propTypes = {
    ruleId: PropTypes.string,
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.string,
    customProps: PropTypes.object,
    result: PropTypes.object, //instanceOf(RuleResultProps),
    emptyValue: PropTypes.string,
  };

  render() {
    const { emptyValue } = this.props;
    const { filtered, total } = this.props.ruleResult || { filtered: emptyValue, total: emptyValue };
    return (
      <span>{filtered}/{total}</span>
    );
  }
}
