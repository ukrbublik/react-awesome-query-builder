import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import startsWith from 'lodash/startsWith'
import GroupContainer from './containers/GroupContainer';
import DraggableGroup from './containers/DraggableGroup';
import { Icon, Button, Radio, Modal } from 'antd';
const { confirm } = Modal;
const ButtonGroup = Button.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const classNames = require('classnames');
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Item from './Item';


export const groupActionsPositionList = {
  topLeft: 'group--actions--tl',
  topCenter: 'group--actions--tc',
  topRight: 'group--actions--tr',
  bottomLeft: 'group--actions--bl',
  bottomCenter: 'group--actions--bc',
  bottomRight: 'group--actions--br'
}

const defaultPosition = 'topRight'

@GroupContainer
@DraggableGroup
class Group extends Component {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    treeNodesCnt: PropTypes.number,
    conjunctionOptions: PropTypes.object.isRequired,
    allowFurtherNesting: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    not: PropTypes.bool,
    selectedConjunction: PropTypes.string,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    path: PropTypes.any, //instanceOf(Immutable.List)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    isDraggingMe: PropTypes.bool,
    isDraggingTempo: PropTypes.bool,
    //actions
    handleDraggerMouseDown: PropTypes.func,
    onDragStart: PropTypes.func,
    addRule: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    setConjunction: PropTypes.func.isRequired,
    setNot: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
  };

  pureShouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  shouldComponentUpdate = this.pureShouldComponentUpdate;

  constructor(props) {
    super(props);

    this._setConjunctionHandlers = {};
  }

  _getSetConjunctionHandler = (itemKey = null) => {
    const k = '' + itemKey;
    let h = this._setConjunctionHandlers[k];
    if (!h) {
      h = this._setConjunction.bind(this, itemKey)
      this._setConjunctionHandlers[k] = h;
    }
    return h;
  }

  _setConjunction = (itemKey, e) => {
    this.props.setConjunction(e, itemKey);
  }

  getGroupPositionClass = () => {
    const { groupActionsPosition } = this.props.config.settings
    return groupActionsPositionList[groupActionsPosition] || groupActionsPositionList[defaultPosition]
  }

  isGroupTopPosition = () => {
    return startsWith(this.props.config.settings.groupActionsPosition || defaultPosition, 'top')
  }

  removeSelf = () => {
    const confirmOptions = this.props.config.settings.removeGroupConfirmOptions;
    const doRemove = () => {
      this.props.removeSelf();
    };
    if (confirmOptions && !this.isEmptyCurrentGroup()) {
      confirm({...confirmOptions,
        onOk: doRemove,
        onCancel: null
      });
    } else {
      doRemove();
    }
  }

  isEmptyCurrentGroup = () => {
    const children = this.props.children1;
    return children.size == 0 ||
      children.size == 1 && this.isEmpty(children.first());
  }

  isEmpty = (item) => {
    return item.get("type") == "group" ? this.isEmptyGroup(item) : this.isEmptyRule(item);
  }

  isEmptyGroup = (group) => {
    const children = group.get("children1");
    return children.size == 0 ||
      children.size == 1 && this.isEmpty(children.first());
  }

  isEmptyRule = (rule) => {
    const properties = rule.get('properties');
    console.log(rule.toJS(), properties.toJS());
      return !(
          properties.get("field") !== null &&
          properties.get("operator") !== null &&
          properties.get("value").filter((val) => val !== undefined).size > 0
      );
  }

  render() {
    return [
        <div key="group-header" className="group--header">
          {this.renderHeader()}
          {this.isGroupTopPosition() && this.renderGroup(this.getGroupPositionClass())}
        </div>
    , this.props.children1 &&
        <div key="group-children" className={classNames(
          "group--children",
          this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--line' : ''
        )}>{this.renderChildren()}</div>
    , !this.isGroupTopPosition() &&
        <div key="group-footer" className='group--footer'>
          {this.renderGroup(this.getGroupPositionClass())}
        </div>
    ];
  }

  renderGroup = (position) => {
    return (
      <div className={`group--actions ${position}`}>
        <ButtonGroup
          size={this.props.config.settings.renderSize || "small"}
        >{!this.props.config.settings.readonlyMode &&
          <Button
            icon="plus"
            className="action action--ADD-RULE"
            onClick={this.props.addRule}
          >{this.props.config.settings.addRuleLabel || "Add rule"}</Button>
          }
          {!this.props.config.settings.readonlyMode && this.props.allowFurtherNesting ? (
            <Button
              className="action action--ADD-GROUP"
              icon="plus-circle-o"
              onClick={this.props.addGroup}
            >{this.props.config.settings.addGroupLabel || "Add group"}</Button>
          ) : null}
          {!this.props.config.settings.readonlyMode && !this.props.isRoot ? (
            <Button
              type="danger"
              icon="delete"
              className="action action--ADD-DELETE"
              onClick={this.removeSelf}
            >{this.props.config.settings.delGroupLabel !== undefined ? this.props.config.settings.delGroupLabel : "Delete"}</Button>
          ) : null}
        </ButtonGroup>
      </div>
    )
  }

  renderChildren = () => {
    let props = this.props;
    return props.children1 ? props.children1.map((item) => (
      <Item
        key={item.get('id')}
        id={item.get('id')}
        //path={props.path.push(item.get('id'))}
        path={item.get('path')}
        type={item.get('type')}
        properties={item.get('properties')}
        config={props.config}
        actions={props.actions}
        children1={item.get('children1')}
        //tree={props.tree}
        treeNodesCnt={props.treeNodesCnt}
        onDragStart={props.onDragStart}
      />
    )).toList() : null;
  }

  renderHeader = () => {
    let renderConjsAsRadios = false;
    return (
      <div className={classNames(
        "group--conjunctions",
        // this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--conj' : ''
      )}>
        {this.props.config.settings.renderConjsAsRadios ?
          <RadioGroup
            disabled={this.props.children1.size < 2}
            value={this.props.selectedConjunction}
            size={this.props.config.settings.renderSize || "small"}
            onChange={this.props.setConjunction}
          >
            {map(this.props.conjunctionOptions, (item, index) => (
              <RadioButton
                key={item.id}
                value={item.key}
              //checked={item.checked}
              >{item.label}</RadioButton>
            ))}
          </RadioGroup>
          :
          <ButtonGroup
            size={this.props.config.settings.renderSize || "small"}
            disabled={this.props.children1.size < 2}
          >
            {this.props.config.settings.showNot &&
              <Button
                onClick={(ev) => this.props.setNot(ev, !this.props.not)}
                type={this.props.not ? "primary" : null}
              >{this.props.config.settings.notLabel}</Button>
            }
            {map(this.props.conjunctionOptions, (item, index) => (
              <Button
                disabled={this.props.children1.size < 2}
                key={item.id}
                type={item.checked ? "primary" : null}
                onClick={this._getSetConjunctionHandler(item.key)}
              >{item.label}</Button>
            ))}
          </ButtonGroup>
        }
        {this.props.config.settings.canReorder && this.props.treeNodesCnt > 2 && !this.props.isRoot &&
          <span className={"qb-drag-handler"} onMouseDown={this.props.handleDraggerMouseDown} > <Icon type="bars" /> </span>
        }
      </div>
    );
  }
}

export default Group;

