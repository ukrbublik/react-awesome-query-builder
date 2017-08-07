import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import size from 'lodash/size';
import {getFieldConfig} from "../../utils/index";
import getFlatTree from "../../utils/getFlatTree";

export default (Rule) => {
  return class RuleContainer extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      operator: PropTypes.string,
      field: PropTypes.string
    };

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

    removeSelf() {
      this.props.actions.removeRule(this.props.path);
    }

    setField(field) {
      this.props.actions.setField(this.props.path, field);
    }

    setOperator(operator) {
      this.props.actions.setOperator(this.props.path, operator);
    }

    setOperatorOption(name, value) {
      this.props.actions.setOperatorOption(this.props.path, name, value);
    }

    setValue(delta, value) {
        this.props.actions.setValue(this.props.path, delta, value);
    }






//todo: sortable support...
//----------------------------------------------------------

_getNodeElById (treeEl, indexId, ignoreCache = false) {
  if (indexId == null)
    return null;
  if (!this._cacheEls)
    this._cacheEls = {};
  var el = this._cacheEls[indexId];
  if (el && document.contains(el) && !ignoreCache)
    return el;
  el = treeEl.querySelector('.group-or-rule[data-id="'+indexId+'"]');
  this._cacheEls[indexId] = el;
  return el;
}

_getDraggableNodeEl (treeEl, ignoreCache = false) {
  if (!this._cacheEls)
    this._cacheEls = {};
  var el = this._cacheEls['draggable'];
  if (el && document.contains(el) && !ignoreCache)
    return el;
  var els = treeEl.getElementsByClassName('m-draggable');
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
  var els = treeEl.getElementsByClassName('placeholder');
  el = els.length ? els[0] : null;
  this._cacheEls['placeholder'] = el;
  return el;
}

  onDragStart (id, dom, e) {
    var treeEl = dom.closest('.query-builder');
    var treeElContainer = treeEl.closest('.query-builder-container');
    if (!treeElContainer)
        treeElContainer = dom.closest('body');
    var scrolTop = treeElContainer.scrollTop;
    this.dragging = {
      id: id,
      w: dom.offsetWidth,
      h: dom.offsetHeight,
      x: dom.offsetLeft,
      y: dom.offsetTop,
      treeEl: treeEl,
      treeElContainer: treeElContainer,
    };

    this._startX = dom.offsetLeft;
    this._startY = dom.offsetTop;
    this._startScrolTop = scrolTop;
    this._offsetX = e.clientX;
    this._offsetY = e.clientY;
    this._start = true;
    this._changed = false;

    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.onDragEnd);
  }


  _onDrag (e) {
    if (this._start) {
      this.setState({
        dragging: this.dragging
      });
      this._start = false;
    }

    var dragging = this.dragging;
    var paddingLeft = this.props.paddingLeft;
    var treeElContainer = dragging.treeElContainer;
    var scrolTop = treeElContainer.scrollTop;
    var newItemInfo = null;
    var itemInfo = this.tree.items[dragging.id];
    if (!itemInfo) {
      return;
    }

    var _startX = this._startX;
    var _startY = this._startY;
    var _offsetX = this._offsetX;
    var _offsetY = this._offsetY;
    
    var pos = {
      x: _startX + e.clientX - _offsetX,
      y: _startY + e.clientY - _offsetY + (scrolTop - this._startScrolTop)
    };
    dragging.x = pos.x;
    dragging.y = pos.y;
    dragging.paddingLeft = paddingLeft;

    newItemInfo = this.moveItem(itemInfo, dragging, e, this.props.canMoveNode, this.props.canMoveToCollapaed || false);

    if(newItemInfo) {
      itemInfo = newItemInfo;
      dragging.id = itemInfo.id;
      this._changed = true;
    } else {
      e.preventDefault();
    }

    this.setState({
      dragging: dragging
    });
  }

  _onDragEnd() {
    this.dragging = {
      id: null,
      x: null,
      y: null,
      w: null,
      h: null
    };
    this.setState({
      dragging: this.dragging
    });

    this._cacheEls = {};

    if (this._changed) {
        //todo ?
    }
    
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.onDragEnd);
  }


moveItem (itemInfo, dragInfo, e, canMoveFn) {
  var newItemInfo = null;
  var paddingLeft = dragInfo.paddingLeft;

  var moveInfo = null;
  var treeEl = dragInfo.treeEl;
  //var treeElContainer = dragInfo.treeElContainer;
  //var scrolTop = treeElContainer.scrollTop;
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
      x: treeRect.right - 10, 
      y: dragDirs.vrt >= 0 ? dragRect.bottom : dragRect.top,
    };
    var hovMnodeEl = document.elementFromPoint(trgCoord.x, trgCoord.y);
    hovMnodeEl = hovMnodeEl ? hovMnodeEl.closest('.group-or-rule') : null;
    if (!hovMnodeEl) {
      //todo: Bug #1: handle "out of tree bounds" problem; scroll tree viewport
      console.log('out of tree bounds!');
    } else {
      var hovNodeId = hovMnodeEl.getAttribute('data-id');
      var hovInnerEls = hovMnodeEl.getElementsByClassName('inner');
      var hovEl = hovInnerEls.length ? hovInnerEls[0] : null;
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
              ? this.tree.items.find(it => it.top == (hovII.top + 1)) //below
              : this.tree.items.find(it => it.top == (hovII.top - 1)); //above
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
          if (isSamePos) {
            //todo: Bug #2: fix 10px offset in css
            dragLeftOffset += 10; //fix, see "padding-left: 10px" at css
          }
          var trgLev = trgLeftOffset / paddingLeft;
          var dragLev = Math.max(0, Math.round(dragLeftOffset / paddingLeft));
          var availMoves = [];
          if (isSamePos) {
            //allow to move only left/right
            var tmp = trgII;
            while (tmp.parent && !tmp.next) {
              var parII = this.tree.items[tmp.parent];
              if (parII.id != 1)
                availMoves.push(['after', parII, parII.lev]);
              tmp = parII;
            }
            if (trgII.prev) {
              var tmp = this.tree.items[trgII.prev];
              while (!tmp.leaf) {
                if (itemInfo.parent != tmp.id)
                  availMoves.push(['append', tmp, tmp.lev+1]);
                if (!tmp.children || !tmp.children.length) {
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
              availMoves.push(['before', trgII, trgII.lev]);
            }
            if (dragDirs.vrt > 0) {
              availMoves.push(['after', trgII, trgII.lev]);
            }
            if (!trgII.leaf && dragDirs.vrt > 0) {
              availMoves.push(['prepend', trgII, trgII.lev+1]);
            }
            if (dragDirs.vrt > 0) {
              var tmp = trgII;
              while (tmp.parent && !tmp.next) {
                var parII = this.tree.items[tmp.parent];
                availMoves.push(['append', parII, parII.lev+1]);
                tmp = parII;
              }
            }
            if (dragDirs.vrt < 0) {
              if (trgII.prev) {
                var tmp = this.tree.items[trgII.prev];
                while (!tmp.leaf) {
                  if (itemInfo.parent != tmp.id)
                    availMoves.push(['append', tmp, tmp.lev+1]);
                  if (!tmp.children || !tmp.children.length) {
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
            if ((placement == 'before' || placement == 'after') && trg.id == 1)
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
          });
console.log(availMoves);
          var bestMode = null;
          availMoves = availMoves.filter(am => this.canMove(itemInfo.id, am[1].id, am[0], canMoveFn));
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
    //console.log('move', itemInfo, moveInfo);
    newItemInfo = this.move(itemInfo.id, moveInfo[1].id, moveInfo[0]);
  }

  return newItemInfo;
}

canMove (fromId, toId, placement, canMoveFn) {
  if(fromId === toId)
    return false;
  
  var fromII = this.tree.items[fromId];
  var toII = this.tree.items[toId];
  if(!fromII || !toII)
    return false;
  var toParentII = null;
  if (placement == 'append' || placement == 'prepend')
    toParentII = toII;
  else
    toParentII = this.tree.items[toII.parent];
  if (toParentII && toParentII.id == 1)
    toParentII = null;

  var res = true;
  if (canMoveFn)
    res = canMoveFn(fromII.node, toII.node, placement, toParentII ? toParentII.node : null);
  return res;
}

move (fromId, toId, placement) {
  //if(!this.canMove(fromId, toId, placement))
  //  return;

  var obj = this.remove(fromId);
  var index = null;

  if(placement === 'before') index = this.insertBefore(obj, toId);
  else if(placement === 'after') index = this.insertAfter(obj, toId);
  else if(placement === 'prepend') index = this.prepend(obj, toId);
  else if(placement === 'append') index = this.append(obj, toId);

  this.updateNodesPosition();
  return index;
}

//----------------------------------------------------------


    render() {
      const fieldConfig = getFieldConfig(this.props.field, this.props.config);
      let isGroup = fieldConfig && fieldConfig.type == '!struct';

      return (<div className={'group-or-rule-container'}>{[this.state.dragging.id == this.props.id ? (
        <Rule
          key={"dragging"}
          id={this.props.id}
          removeSelf={this.removeSelf.bind(this)}
          setField={() => {}}
          setOperator={() => {}}
          setOperatorOption={() => {}}
          removeSelf={() => {}}
          selectedField={this.props.field || null}
          selectedOperator={this.props.operator || null}
          value={this.props.value || null}
          operatorOptions={this.props.operatorOptions}
          config={this.props.config}
          dragging={this.state.dragging}
          renderType={'dragging'}
        />
      ) : null, (
        <Rule
          key={this.props.id}
          id={this.props.id}
          removeSelf={this.removeSelf.bind(this)}
          setField={this.setField.bind(this)}
          setOperator={this.setOperator.bind(this)}
          setOperatorOption={this.setOperatorOption.bind(this)}
          setValue={this.setValue.bind(this)}
          onDragStart={this.onDragStart.bind(this)}
          selectedField={this.props.field || null}
          selectedOperator={this.props.operator || null}
          value={this.props.value || null}
          operatorOptions={this.props.operatorOptions}
          config={this.props.config}
          dragging={this.state.dragging}
          renderType={this.state.dragging.id == this.props.id ? 'placeholder' : null}
        />
      )]}</div>);
    }
  };
};
