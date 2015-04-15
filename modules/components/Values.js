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
          value: this.props.value.get(delta),
          setValue: value => RuleActions.setDeltaValue(this.context.path, delta, value, this.context.config)
        });

        widgets.push(
          <div key={delta} className={'widget widget--' + name}>{widget}</div>
        );
      }

      return (
        <div className="rule--widgets">{widgets}</div>
      );
    }

    let widget = React.createElement(this.props.widget.component, {
      definition: this.props.widget,
      field: this.props.field,
      cardinality: this.props.cardinality,
      value: this.props.value,
      setDeltaValue: (delta, value) => RuleActions.setDeltaValue(this.context.path, delta, value, this.context.config)
    });

    return (
      <div className="rule--widgets">
        <div className={'widget widget--' + name}>{widget}</div>
      </div>
    );
  }
}

Values.contextTypes = {
  config: React.PropTypes.object.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired
};

Values.propTypes = {
  value: React.PropTypes.instanceOf(Immutable.List).isRequired,
  field: React.PropTypes.object.isRequired,
  cardinality: React.PropTypes.number.isRequired,
  widget: React.PropTypes.object.isRequired
};

export default Values;
