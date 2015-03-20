import React from 'react';
import Immutable from 'immutable';
import RuleActions from '../actions/Rule';

class Options extends React.Component {
  render () {
    if (!this.props.operator.options || !this.props.operator.options.component) {
      return null;
    }

    let options = React.createElement(this.props.operator.options.component, {
      definition: this.props.operator,
      field: this.props.field,
      options: this.props.options,
      setOption: (name, value) => RuleActions.setOption(this.props.path, name, value, this.props.config)
    });

    return (
      <div className="filter--options">{options}</div>
    );
  }
}

Options.propTypes = {
  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
  options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  config: React.PropTypes.object.isRequired,
  field: React.PropTypes.object.isRequired,
  operator: React.PropTypes.object.isRequired
};

export default Options;
