import React, { PureComponent } from "react";
import PropTypes from "prop-types";
const classNames = require("classnames");


export default (className) => (GroupOrRule) => {
  return class Draggable extends PureComponent {
    static propTypes = {
      isDraggingTempo: PropTypes.bool,
      isDraggingMe: PropTypes.bool,
      onDragStart: PropTypes.func,
      dragging: PropTypes.object, //{id, x, y, w, h}
    };

    constructor(props) {
      super(props);
      this.wrapper = React.createRef();
    }

    handleDraggerMouseDown = (e) => {
      var nodeId = this.props.id;
      var dom = this.wrapper.current;
        
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
        isDraggingMe && isDraggingTempo ? "qb-draggable" : null,
        isDraggingMe && !isDraggingTempo ? "qb-placeholder" : null,
      );

      return (
        <div
          className={cn}
          style={styles}
          ref={this.wrapper}
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

  };
};
