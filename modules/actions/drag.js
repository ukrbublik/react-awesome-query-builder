import * as constants from '../constants';


// /**
//  * @param {Object} dragging
//  */
// export const setDragging = (dragging) => ({
//   type: constants.SET_DRAGGING,
//   dragging: dragging,
// });

// /**
//  * @param {Object} mousePos
//  */
// export const setMousePos = (mousePos) => ({
//   type: constants.SET_MOUSE_POS,
//   mousePos: mousePos,
// });

// /**
//  * @param {Object} dragStart
//  */
// export const setDragStart = (dragStart) => ({
//   type: constants.SET_DRAG_START,
//   dragStart: dragStart,
// });


/**
 * @param {Object} mousePos
 * @param {Object} dragging
 */
export const setDragProgress = (mousePos, dragging) => ({
  type: constants.SET_DRAG_PROGRESS,
  mousePos: mousePos,
  dragging: dragging,
});

/**
 * @param {Object} dragStart
 * @param {Object} dragging
 * @param {Object} mousePos
 */
export const setDragStart = (dragStart, dragging, mousePos) => ({
  type: constants.SET_DRAG_START,
  dragStart: dragStart,
  dragging: dragging,
  mousePos: mousePos,
});

/**
 *
 */
export const setDragEnd = () => ({
  type: constants.SET_DRAG_END,
});
