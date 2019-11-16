import React, { Component } from 'react';
import PropTypes from 'prop-types';
const classNames = require('classnames');
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default (Group) => {
  return class DraggableGroup extends Component {
    static propTypes = {
        isDraggingTempo: PropTypes.bool,
        isDraggingMe: PropTypes.bool,
        onDragStart: PropTypes.func,
        dragging: PropTypes.object, //{id, x, y, w, h}
    };

    pureShouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    shouldComponentUpdate = this.pureShouldComponentUpdate;

    constructor(props) {
        super(props);
    }

    handleDraggerMouseDown = (e) => {
      var nodeId = this.props.id;
      var dom = this.refs.group;
      
      if (this.props.onDragStart) {
        this.props.onDragStart(nodeId, dom, e);
      }
    }

    render () {
        let {
          isDraggingTempo,
          isDraggingMe,
          dragging,
          ...otherProps
        } = this.props;

        if (!isDraggingMe && isDraggingTempo)
          return null;

        let styles = {};
        if (isDraggingTempo) {
            styles = {
                top: dragging.y,
                left: dragging.x,
                width: dragging.w
            };
        }

        const className = classNames("group", "group-or-rule",
          isDraggingMe && isDraggingTempo ? 'qb-draggable' : null,
          isDraggingMe && !isDraggingTempo ? 'qb-placeholder' : null,
        );

        return (
          <div
              className={className}
              style={styles}
              ref="group"
              data-id={this.props.id}
          >
              <Group
                handleDraggerMouseDown={this.handleDraggerMouseDown}
                isDraggingMe={isDraggingMe}
                isDraggingTempo={isDraggingTempo}
                {...otherProps}
              />
          </div>
        );
    }

  }
}
