import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import Immutable from 'immutable';
import RuleActions from '../actions/Rule';

class Options extends PureComponent {
  render () {
    if (!this.props.operator.options || !this.props.operator.options.factory) {
      return null;
    }

    const { factory, ...operatorProps } = this.props.operator.options;
    const renderedOptions = factory(Object.assign({}, operatorProps, {
      field: this.props.field,
      options: this.props.options,
      setOption: (name, value) => RuleActions.setOption(this.props.path, name, value, this.context.config)
    }));

    return (
      <div className="rule--options">{renderedOptions}</div>
    );
  }
}

Options.contextTypes = {
  config: PropTypes.object.isRequired
};

Options.propTypes = {
  options: PropTypes.instanceOf(Immutable.Map).isRequired,
  field: PropTypes.object.isRequired,
  operator: PropTypes.object.isRequired
};

export default Options;
