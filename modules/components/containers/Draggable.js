import React, { Component } from 'react';
import PropTypes from 'prop-types';
const classNames = require('classnames');
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default (className) => (GroupOrRule) => {
  return class Draggable extends Component {
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
        var dom = this.refs.wrapper;

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

        const cn = classNames(className, "group-or-rule",
          isDraggingMe && isDraggingTempo ? 'qb-draggable' : null,
          isDraggingMe && !isDraggingTempo ? 'qb-placeholder' : null,
        );

        return (
          <div
            className={cn}
            style={styles}
            ref="wrapper"
            data-id={this.props.id}
          >
            <GroupOrRule
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
