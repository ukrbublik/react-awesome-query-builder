import React from 'react';
import Immutable from 'immutable';
import assign from 'react/lib/Object.assign';
import FilterActions from '../actions/Filter';
import OperatorActions from '../actions/Operator';

class Filter extends React.Component {
  render () {
    let widgets = [];
    let path = this.props.path;
    let cardinality = this.props.operator.cardinality || 1;

    for (let delta = 0; delta < cardinality; delta++) {
      widgets.push(React.createElement(this.props.widget.component, {
        key: delta,
        definition: this.props.widget,
        field: this.props.field,
        delta: delta,
        value: this.props.value[delta],
        setValue: value => FilterActions.setDeltaValue(path, delta, value)
      }));
    }

    return React.createElement(this.props.operator.component, {
      children: widgets,
      definition: this.props.operator,
      field: this.props.field,
      value: this.props.value,
      options: this.props.options,
      setOption: (name, value) => OperatorActions.setOption(path, name, value)
    });
  }
}

Filter.propTypes = {
  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
  field: React.PropTypes.object.isRequired,
  operator: React.PropTypes.object.isRequired,
  widget: React.PropTypes.object.isRequired,
  value: React.PropTypes.any
};

export default Filter;
