import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import size from 'lodash/size';
import {getFieldConfig} from "../../utils/index";
import getFlatTree from "../../utils/getFlatTree";
import * as constants from '../../constants';

//todo: add to readme about .query-builder-container

export default (RuleOrGroup, CanMoveFn = null) => {
  return class SortableContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dragging: {
              id: null,
              x: null,
              y: null,
              w: null,
              h: null
            }
        };

        this.onDrag = this._onDrag.bind(this);
        this.onDragEnd = this._onDragEnd.bind(this);

        this.componentWillReceiveProps(props);
    }

    shouldComponentUpdate = shallowCompare;

    componentWillReceiveProps(nextProps) {
        this.tree = getFlatTree(nextProps.tree);
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

    onDragStart (id, dom, e) {
      var treeEl = dom.closest('.query-builder');
      var treeElContainer = treeEl.closest('.query-builder-container');
      if (!treeElContainer)
          treeElContainer = dom.closest('body');
      var scrollTop = treeElContainer.scrollTop;

      this.draggingInfo = {
        id: id,
        w: dom.offsetWidth,
        h: dom.offsetHeight,
        x: dom.offsetLeft,
        y: dom.offsetTop,
        treeEl: treeEl,
        treeElContainer: treeElContainer,
      };
      this.dragStartInfo = {
        x: dom.offsetLeft,
        y: dom.offsetTop,
        scrollTop: scrollTop,
        offsetX: e.clientX,
        offsetY: e.clientY,
      };
      this.didAnySortOnDrag = false;

      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.onDragEnd);

      this.setState({
        dragging: this.draggingInfo
      });
    }


    _onDrag (e) {
      var dragging = this.draggingInfo;
      var paddingLeft = this.props.paddingLeft;
      var treeElContainer = dragging.treeElContainer;
      var scrollTop = treeElContainer.scrollTop;
      var itemInfo = this.tree.items[dragging.id];
      if (!itemInfo) {
        return;
      }

      var startX = this.dragStartInfo.x;
      var startY = this.dragStartInfo.y;
      var startOffsetX = this.dragStartInfo.offsetX;
      var startOffsetY = this.dragStartInfo.offsetY;
      var startScrollTop = this.dragStartInfo.scrollTop;
      
      var pos = {
        x: startX + (e.clientX - startOffsetX),
        y: startY + (e.clientY - startOffsetY) + (scrollTop - startScrollTop)
      };
      dragging.x = pos.x;
      dragging.y = pos.y;
      dragging.paddingLeft = paddingLeft;

      var moved = this.handleDrag(itemInfo, dragging, e, CanMoveFn);

      if (moved) {
        this.didAnySortOnDrag = true;
      } else {
        e.preventDefault();
      }

      this.setState({
        dragging: dragging
      });
    }

    _onDragEnd() {
      this.draggingInfo = {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null
      };
      this.setState({
        dragging: this.draggingInfo
      });

      this._cacheEls = {};

      if (this.didAnySortOnDrag) {
          //todo ?
      }
      
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.onDragEnd);
    }


    handleDrag (itemInfo, dragInfo, e, canMoveFn) {
      var newItemInfo = null;
      var paddingLeft = dragInfo.paddingLeft;

      var moveInfo = null;
      var treeEl = dragInfo.treeEl;
      //var treeElContainer = dragInfo.treeElContainer;
      //var scrollTop = treeElContainer.scrollTop;
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
        var hovMnodeEl = document.elementFromPoint(trgCoord.x, trgCoord.y);
        hovMnodeEl = hovMnodeEl ? hovMnodeEl.closest('.group-or-rule-container') : null;
        if (!hovMnodeEl) {
          console.log('out of tree bounds!');
        } else {
          var isGroup = hovMnodeEl.classList.contains('group-container');
          var hovNodeId = hovMnodeEl.getAttribute('data-id');
          var hovEl = null;
          if (isGroup) {
            var hovInnerEls = hovMnodeEl.getElementsByClassName('group--header');
            var hovEl = hovInnerEls.length ? hovInnerEls[0] : null;
          } else {
            hovEl = hovMnodeEl;
          }
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
              var isOverHover = (dragDirs.vrt < 0 //up
                ? ((hovRect.bottom - dragRect.top) > hovHeight/2)
                : ((dragRect.bottom - hovRect.top) > hovHeight/2));
              if (isOverHover) {
                trgII = hovII;
                trgRect = hovRect;
                trgEl = hovEl;
              } else {
                var trgII = dragDirs.vrt <= 0 //up
                  ? Object.values(this.tree.items).find(it => it.top == (hovII.top + 1)) //below
                  : Object.values(this.tree.items).find(it => it.top == (hovII.top - 1)); //above
                if (trgII) {
                  if (trgII.id == dragId) {
                    trgEl = plhEl;
                  } else
                    trgEl = this._getNodeElById(treeEl, trgII.id);
                  trgRect = trgEl.getBoundingClientRect();
                }
              }
            }

            var isSamePos = (trgII && trgII.id == dragId);
            if (trgRect) {
              var dragLeftOffset = dragRect.left - treeRect.left;
              var trgLeftOffset = trgRect.left - treeRect.left;
              //if (isSamePos) {
              //  dragLeftOffset += 1; //?
              //}
              var trgLev = trgLeftOffset / paddingLeft;
              var dragLev = Math.max(0, Math.round(dragLeftOffset / paddingLeft));
              var availMoves = [];
              if (isSamePos) {
                //allow to move only left/right
                var tmp = trgII;
                while (tmp.parent && !tmp.next) {
                  var parII = this.tree.items[tmp.parent];
                  if (parII.id != 1)
                    availMoves.push([constants.PLACEMENT_AFTER, parII, parII.lev]);
                  tmp = parII;
                }
                if (trgII.prev) {
                  var tmp = this.tree.items[trgII.prev];
                  while (!tmp.leaf) {
                    if (itemInfo.parent != tmp.id)
                      availMoves.push([constants.PLACEMENT_APPEND, tmp, tmp.lev+1]);
                    if (!tmp.children || !tmp.children.length || tmp.collapsed) {
                      break;
                    } else {
                      var lastChildId = tmp.children[tmp.children.length - 1];
                      var lastChildII = this.tree.items[lastChildId];
                      tmp = lastChildII;
                    }
                  }
                }
              } else {
                //find out where we can move..
                if (dragDirs.vrt < 0) {
                  availMoves.push([constants.PLACEMENT_BEFORE, trgII, trgII.lev]);
                }
                if (dragDirs.vrt > 0 && (trgII.leaf || trgII.collapsed)) {
                  availMoves.push([constants.PLACEMENT_AFTER, trgII, trgII.lev]);
                }
                if (!trgII.leaf && dragDirs.vrt > 0) {
                  availMoves.push([constants.PLACEMENT_PREPEND, trgII, trgII.lev+1]);
                }
                if (dragDirs.vrt > 0) {
                  var tmp = trgII;
                  while (tmp.parent && !tmp.next) {
                    var parII = this.tree.items[tmp.parent];
                    availMoves.push([constants.PLACEMENT_APPEND, parII, parII.lev+1]);
                    tmp = parII;
                  }
                }
                if (dragDirs.vrt < 0) {
                  if (trgII.prev) {
                    var tmp = this.tree.items[trgII.prev];
                    while (!tmp.leaf) {
                      if (itemInfo.parent != tmp.id)
                        availMoves.push([constants.PLACEMENT_APPEND, tmp, tmp.lev+1]);
                      if (!tmp.children || !tmp.children.length || tmp.collapsed) {
                        break;
                      } else {
                        var lastChildId = tmp.children[tmp.children.length - 1];
                        var lastChildII = this.tree.items[lastChildId];
                        tmp = lastChildII;
                      }
                    }
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
console.log(availMoves.map(am => am[0]));
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
      return <RuleOrGroup
          {...this.props}
          dragging={this.state.dragging}
          onDragStart={this.onDragStart.bind(this)}
      />;
    }

  }
}

