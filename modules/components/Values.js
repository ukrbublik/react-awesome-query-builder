import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import Immutable from 'immutable';
import RuleActions from '../actions/Rule';

class Values extends PureComponent {
  render () {
    if (this.props.cardinality === 0) {
      return null;
    }

    let name = this.props.widget.name.toUpperCase();
    if (typeof this.props.widget.behavior === 'undefined') {
      let widgets = [];

      for (let delta = 0; delta < this.props.cardinality; delta++) {
        let widget = this.props.widget.factory({
          definition: this.props.widget,
          field: this.props.field,
          delta: delta,
          value: this.props.value.get(delta),
          setValue: value => RuleActions.setDeltaValue(this.props.path, delta, value, this.context.config)
        });

        widgets.push(
          <div key={delta} className={'widget widget--' + name}>{widget}</div>
        );
      }

      return (
        <div className="rule--widgets">{widgets}</div>
      );
    }

    let widget = this.props.widget.factory({
      definition: this.props.widget,
      field: this.props.field,
      cardinality: this.props.cardinality,
      value: this.props.value,
      setDeltaValue: (delta, value) => RuleActions.setDeltaValue(this.props.path, delta, value, this.context.config)
    });

    return (
      <div className="rule--widgets">
        <div className={'widget widget--' + name}>{widget}</div>
      </div>
    );
  }
}

Values.contextTypes = {
  config: PropTypes.object.isRequired
};

Values.propTypes = {
  path: PropTypes.instanceOf(Immutable.List).isRequired,
  value: PropTypes.instanceOf(Immutable.List).isRequired,
  field: PropTypes.object.isRequired,
  cardinality: PropTypes.number.isRequired,
  widget: PropTypes.object.isRequired
};

export default Values;
