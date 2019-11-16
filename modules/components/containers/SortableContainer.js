import React, { Component } from 'react';
import { createStore } from 'redux';
import {Provider, Connector, connect} from 'react-redux';
import shallowCompare from 'react-addons-shallow-compare';
import size from 'lodash/size';
import {getFieldConfig} from "../../utils/configUtils";
import {getFlatTree} from "../../utils/treeUtils";
import * as constants from '../../constants';
import clone from 'clone';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import * as actions from '../../actions';


export default (Builder, CanMoveFn = null) => {
  class ConnectedSortableContainer extends Component {

    static propTypes = {
      tree: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
      actions: PropTypes.object.isRequired, // {moveItem: Function, ..}
      //... see Builder
    };

    constructor(props) {
        super(props);

        this.componentWillReceiveProps(props);
    }

    shouldComponentUpdate = shallowCompare;

    componentWillReceiveProps(nextProps) {
        this.tree = getFlatTree(nextProps.tree);
    }

    componentDidUpdate(_prevProps, _prevState) {
        var dragging = this.props.dragging;
        var startDragging = this.props.dragStart;
        if (startDragging && startDragging.id) {
            dragging.itemInfo = this.tree.items[dragging.id];
            if (dragging.itemInfo) {
              if (dragging.itemInfo.index != startDragging.itemInfo.index || dragging.itemInfo.parent != startDragging.itemInfo.parent) {
                var treeEl = startDragging.treeEl;
                var treeElContainer = startDragging.treeElContainer;
                var plhEl = this._getPlaceholderNodeEl(treeEl, true);
                if (plhEl) {
                    var plX = plhEl.getBoundingClientRect().left + window.scrollX;
                    var plY = plhEl.getBoundingClientRect().top + window.scrollY;
                    var oldPlX = startDragging.plX;
                    var oldPlY = startDragging.plY;
                    var scrollTop = treeElContainer.scrollTop;
                    startDragging.plX = plX;
                    startDragging.plY = plY;
                    startDragging.itemInfo = clone(dragging.itemInfo);
                    startDragging.y = plhEl.offsetTop;
                    startDragging.x = plhEl.offsetLeft;
                    startDragging.clientY += (plY - oldPlY);
                    startDragging.clientX += (plX - oldPlX);
                    startDragging.scrollTop = scrollTop;

                    this.onDrag(this.props.mousePos, false);
                }
              }
            }
        }
    }

    _getNodeElById (treeEl, indexId, ignoreCache = false) {
      if (indexId == null)
        return null;
      if (!this._cacheEls)
        this._cacheEls = {};
      var el = this._cacheEls[indexId];
      if (el && document.contains(el) && !ignoreCache)
        return el;
      el = treeEl.querySelector('.group-or-rule-container[data-id="'+indexId+'"]');
      this._cacheEls[indexId] = el;
      return el;
    }

    _getDraggableNodeEl (treeEl, ignoreCache = false) {
      if (!this._cacheEls)
        this._cacheEls = {};
      var el = this._cacheEls['draggable'];
      if (el && document.contains(el) && !ignoreCache)
        return el;
      var els = treeEl.getElementsByClassName('qb-draggable');
      el = els.length ? els[0] : null;
      this._cacheEls['draggable'] = el;
      return el;
    }

    _getPlaceholderNodeEl (treeEl, ignoreCache = false) {
      if (!this._cacheEls)
        this._cacheEls = {};
      var el = this._cacheEls['placeholder'];
      if (el && document.contains(el) && !ignoreCache)
        return el;
      var els = treeEl.getElementsByClassName('qb-placeholder');
      el = els.length ? els[0] : null;
      this._cacheEls['placeholder'] = el;
      return el;
    }

    onDragStart = (id, dom, e) => {
      var treeEl = dom.closest('.query-builder');
      treeEl.classList.add("qb-dragging");
      var treeElContainer = treeEl.closest('.query-builder-container');
      if (!treeElContainer)
          treeElContainer = dom.closest('body');
      var scrollTop = treeElContainer.scrollTop;
      
      var _dragEl = this._getDraggableNodeEl(treeEl);
      var _plhEl = this._getPlaceholderNodeEl(treeEl);

      var tmpAllGroups = treeEl.querySelectorAll('.group--children');
      var anyGroup = tmpAllGroups.length ? tmpAllGroups[0] : null;
      var groupPadding;
      if (anyGroup) {
        groupPadding = window.getComputedStyle(anyGroup, null).getPropertyValue('padding-left');
        groupPadding = parseInt(groupPadding);
      }

      let dragging = {
        id: id,
        x: dom.offsetLeft,
        y: dom.offsetTop,
        w: dom.offsetWidth,
        h: dom.offsetHeight,
        itemInfo: this.tree.items[id],
        paddingLeft: groupPadding,
      };
      let dragStart = {
        id: id,
        x: dom.offsetLeft,
        y: dom.offsetTop,
        scrollTop: scrollTop,
        clientX: e.clientX,
        clientY: e.clientY,
        itemInfo: clone(this.tree.items[id]),
        treeEl: treeEl,
        treeElContainer: treeElContainer,
      };
      let mousePos = {
        clientX: e.clientX,
        clientY: e.clientY,
      };

      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.onDragEnd);

      this.props.setDragStart(dragStart, dragging, mousePos);
    }


    onDrag = (e, doHandleDrag = true) => {
      var dragging = Object.assign({}, this.props.dragging);
      var startDragging = this.props.dragStart;
      var paddingLeft = dragging.paddingLeft; //this.props.paddingLeft;
      var treeElContainer = startDragging.treeElContainer;
      var scrollTop = treeElContainer.scrollTop;
      dragging.itemInfo = this.tree.items[dragging.id];
      if (!dragging.itemInfo) {
        return;
      }

      let mousePos = {
        clientX: e.clientX,
        clientY: e.clientY,
      };

      //first init plX/plY
      if (!startDragging.plX) {
        var treeEl = startDragging.treeEl;
        var plhEl = this._getPlaceholderNodeEl(treeEl);
        if (plhEl) {
            startDragging.plX = plhEl.getBoundingClientRect().left + window.scrollX;
            startDragging.plY = plhEl.getBoundingClientRect().top + window.scrollY;
        }
      }

      var startX = startDragging.x;
      var startY = startDragging.y;
      var startClientX = startDragging.clientX;
      var startClientY = startDragging.clientY;
      var startScrollTop = startDragging.scrollTop;
      var pos = {
        x: startX + (e.clientX - startClientX),
        y: startY + (e.clientY - startClientY) + (scrollTop - startScrollTop)
      };
      dragging.x = pos.x;
      dragging.y = pos.y;
      dragging.paddingLeft = paddingLeft;

      this.props.setDragProgress(mousePos, dragging);

      var moved = doHandleDrag ? this.handleDrag(dragging, e, CanMoveFn) : false;

      if (moved) {
      } else {
        if (e.preventDefault)
          e.preventDefault();
      }
    }

    onDragEnd = () => {
      var treeEl = this.props.dragStart.treeEl;

      this.props.setDragEnd();

      treeEl.classList.remove("qb-dragging");
      this._cacheEls = {};

      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.onDragEnd);
    }


    handleDrag (dragInfo, e, canMoveFn) {
      var itemInfo = dragInfo.itemInfo;
      var paddingLeft = dragInfo.paddingLeft;

      var moveInfo = null;
      var treeEl = this.props.dragStart.treeEl;
      var dragId = dragInfo.id;
      var dragEl = this._getDraggableNodeEl(treeEl);
      var plhEl = this._getPlaceholderNodeEl(treeEl);
      if (dragEl && plhEl) {
        var dragRect = dragEl.getBoundingClientRect();
        var plhRect = plhEl.getBoundingClientRect();
        if (!plhRect.width) {
            return;
        }
        var dragDirs = {hrz: 0, vrt: 0};
        if (dragRect.top < plhRect.top)
          dragDirs.vrt = -1; //up
        else if (dragRect.bottom > plhRect.bottom)
          dragDirs.vrt = +1; //down
        if (dragRect.left > plhRect.left)
          dragDirs.hrz = +1; //right
        else if (dragRect.left < plhRect.left)
          dragDirs.hrz = -1; //left

        var treeRect = treeEl.getBoundingClientRect();
        var trgCoord = {
          x: treeRect.left + (treeRect.right - treeRect.left) / 2,
          y: dragDirs.vrt >= 0 ? dragRect.bottom : dragRect.top,
        };
        var hovNodeEl = document.elementFromPoint(trgCoord.x, trgCoord.y-1);
        var hovCNodeEl = hovNodeEl ? hovNodeEl.closest('.group-or-rule-container') : null;
        if (!hovCNodeEl) {
          console.log('out of tree bounds!');
        } else {
          var isGroup = hovCNodeEl.classList.contains('group-container');
          var hovNodeId = hovCNodeEl.getAttribute('data-id');
          var hovEl = hovCNodeEl;
          var doAppend = false;
          var doPrepend = false;
          if (hovEl) {
            var hovRect = hovEl.getBoundingClientRect();
            var hovHeight = hovRect.bottom - hovRect.top;
            var hovII = this.tree.items[hovNodeId];
            var trgRect = null,
                trgEl = null,
                trgII = null;

            if (dragDirs.vrt == 0) {
              trgII = itemInfo;
              trgEl = plhEl;
              if (trgEl)
                trgRect = trgEl.getBoundingClientRect();
            } else {
              if (isGroup) {
                if (dragDirs.vrt > 0) { //down
                    //take group header (for prepend only)
                    var hovInnerEl = hovCNodeEl.getElementsByClassName('group--header');
                    var hovEl2 = hovInnerEl.length ? hovInnerEl[0] : null;
                    var hovRect2 = hovEl2.getBoundingClientRect();
                    var hovHeight2 = hovRect2.bottom - hovRect2.top;
                    var isOverHover = ((dragRect.bottom - hovRect2.top) > hovHeight2*3/4);
                    if (isOverHover && hovII.top > dragInfo.itemInfo.top) {
                      trgII = hovII;
                      trgRect = hovRect2;
                      trgEl = hovEl2;
                      doPrepend = true;
                    }
                } else if (dragDirs.vrt < 0) { //up
                  if (hovII.lev >= itemInfo.lev) {
                    //take whole group
                    //todo: 5 is magic for now (bottom margin), configure it!
                    var isClimbToHover = ((hovRect.bottom - dragRect.top) >= 2);
                    if (isClimbToHover && hovII.top < dragInfo.itemInfo.top) {
                        trgII = hovII;
                        trgRect = hovRect;
                        trgEl = hovEl;
                        doAppend = true;
                    }
                  }
                }
                if (!doPrepend && !doAppend) {
                  //take whole group and check if we can move before/after group
                  var isOverHover = (dragDirs.vrt < 0 //up
                    ? ((hovRect.bottom - dragRect.top) > (hovHeight-5))
                    : ((dragRect.bottom - hovRect.top) > (hovHeight-5)));
                  if (isOverHover) {
                    trgII = hovII;
                    trgRect = hovRect;
                    trgEl = hovEl;
                  }
                }
              } else {
                //check if we can move before/after group
                  var isOverHover = (dragDirs.vrt < 0 //up
                    ? ((hovRect.bottom - dragRect.top) > hovHeight/2)
                    : ((dragRect.bottom - hovRect.top) > hovHeight/2));
                  if (isOverHover) {
                    trgII = hovII;
                    trgRect = hovRect;
                    trgEl = hovEl;
                  }
              }
            }

            var isSamePos = (trgII && trgII.id == dragId);
            if (trgRect) {
              var dragLeftOffset = dragRect.left - treeRect.left;
              var trgLeftOffset = trgRect.left - treeRect.left;
              var _trgLev = trgLeftOffset / paddingLeft;
              var dragLev = Math.max(0, Math.round(dragLeftOffset / paddingLeft));
              var availMoves = [];
              if (isSamePos) {
                //do nothing
              } else {
                if (isGroup) {
                    if (doAppend) {
                      availMoves.push([constants.PLACEMENT_APPEND, trgII, trgII.lev+1]);
                    } else if (doPrepend) {
                      availMoves.push([constants.PLACEMENT_PREPEND, trgII, trgII.lev+1]);
                    }
                }
                if (!doAppend && !doPrepend) {
                    if (dragDirs.vrt < 0) {
                      availMoves.push([constants.PLACEMENT_BEFORE, trgII, trgII.lev]);
                    } else if (dragDirs.vrt > 0) {
                      availMoves.push([constants.PLACEMENT_AFTER, trgII, trgII.lev]);
                    }
                }
              }

              //sanitize
              availMoves = availMoves.filter(am => {
                var placement = am[0];
                var trg = am[1];
                if ((placement == constants.PLACEMENT_BEFORE || placement == constants.PLACEMENT_AFTER) && trg.parent == null)
                  return false;
                if (trg.collapsed && (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND))
                  return false;

                var isInside = (trg.id == itemInfo.id);
                if (!isInside) {
                  var tmp = trg;
                  while (tmp.parent) {
                    tmp = this.tree.items[tmp.parent];
                    if (tmp.id == itemInfo.id) {
                      isInside = true;
                      break;
                    }
                  }
                }
                return !isInside;
              }).map(am => {
                var placement = am[0],
                  toII = am[1];
                var toParentII = null;
                if (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND)
                  toParentII = toII;
                else
                  toParentII = this.tree.items[toII.parent];
                if (toParentII && toParentII.parent == null)
                  toParentII = null;
                am[3] = toParentII;
                return am;
              });

              var bestMode = null;
              availMoves = availMoves.filter(am => this.canMove(itemInfo, am[1], am[0], am[3], canMoveFn));
              var levs = availMoves.map(am => am[2]);
              var curLev = itemInfo.lev;
              var allLevs = levs.concat(curLev);
              var closestDragLev = null;
              if (allLevs.indexOf(dragLev) != -1)
                closestDragLev = dragLev;
              else if (dragLev > Math.max(...allLevs))
                closestDragLev = Math.max(...allLevs);
              else if (dragLev < Math.min(...allLevs))
                closestDragLev = Math.min(...allLevs);
              bestMode = availMoves.find(am => am[2] == closestDragLev);
              if (!isSamePos && !bestMode && availMoves.length)
                bestMode = availMoves[0];
              moveInfo = bestMode;
            }
          }
        }
      }

      if (moveInfo) {
        console.log('moveInfo', moveInfo);
        this.move(itemInfo, moveInfo[1], moveInfo[0], moveInfo[3]);
        return true;
      }

      return false;
    }

    canMove (fromII, toII, placement, toParentII, canMoveFn) {
      if(!fromII || !toII)
        return false;
      if(fromII.id === toII.id)
        return false;

      var res = true;
      if (canMoveFn)
        res = canMoveFn(fromII.node.toJS(), toII.node.toJS(), placement, toParentII ? toParentII.node.toJS() : null);
      return res;
    }

    move (fromII, toII, placement, toParentII) {
      //console.log('move', fromII, toII, placement, toParentII);
      this.props.actions.moveItem(fromII.path, toII.path, placement);
    }

    render() {
      return <Builder
          {...this.props}
          onDragStart={this.onDragStart}
      />;
    }

  }

  const SortableContainer = connect(
      (state) => {
          return {
            dragging: state.dragging,
            dragStart: state.dragStart,
            mousePos: state.mousePos,
          }
      }, {
        setDragStart: actions.drag.setDragStart,
        setDragProgress: actions.drag.setDragProgress,
        setDragEnd: actions.drag.setDragEnd,
      }
  )(ConnectedSortableContainer);

  return SortableContainer;

}

