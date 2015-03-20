import React from 'react';
import Immutable from 'immutable';
import RuleActions from '../actions/Rule';

class Values extends React.Component {
  render () {
    if (this.props.cardinality === 0) {
      return null;
    }

    let name = this.props.widget.name.toUpperCase();
    if (typeof this.props.widget.behavior === 'undefined') {
      let widgets = [];

      for (let delta = 0; delta < this.props.cardinality; delta++) {
        let widget = React.createElement(this.props.widget.component, {
          key: delta,
          definition: this.props.widget,
          field: this.props.field,
          delta: delta,
          value: this.props.value[delta],
          setValue: value => RuleActions.setDeltaValue(this.props.path, delta, value, this.props.config)
        });

        widgets.push(
          <div key={delta} className={'widget widget--' + name}>{widget}</div>
        );
      }

      return (
        <div className="filter--values">{widgets}</div>
      );
    }

    let widget = React.createElement(this.props.widget.component, {
      definition: this.props.widget,
      field: this.props.field,
      cardinality: this.props.cardinality,
      value: this.props.value,
      setDeltaValue: (delta, value) => RuleActions.setDeltaValue(this.props.path, delta, value, this.props.config)
    });

    return (
      <div className="filter--values">
        <div className={'widget widget--' + name}>{widget}</div>
      </div>
    );
  }
}

Values.propTypes = {
  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
  value: React.PropTypes.instanceOf(Immutable.List).isRequired,
  config: React.PropTypes.object.isRequired,
  field: React.PropTypes.object.isRequired,
  cardinality: React.PropTypes.number.isRequired,
  widget: React.PropTypes.object.isRequired
};

export default Values;
