import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import startsWith from 'lodash/startsWith'
import GroupContainer from './containers/GroupContainer';
import Draggable from './containers/Draggable';
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
@Draggable("group")
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
    const isGroupTopPosition = this.isGroupTopPosition();
    return [
        <div key="group-header" className="group--header">
          {this.renderHeader()}
          {isGroupTopPosition && this.renderActions()}
        </div>
    , this.props.children1 &&
        <div key="group-children" className={classNames(
          "group--children",
          this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--line' : ''
        )}>{this.renderChildren()}</div>
    , !isGroupTopPosition &&
        <div key="group-footer" className='group--footer'>
          {this.renderActions()}
        </div>
    ];
  }

  renderActions = () => {
    const position = this.getGroupPositionClass();
    return <Actions
      config={this.props.config}
      position={position}
      addRule={this.props.addRule}
      addGroup={this.props.addGroup}
      allowFurtherNesting={this.props.allowFurtherNesting}
      isRoot={this.props.isRoot}
      removeSelf={this.removeSelf}
    />;
  }

  renderChildren = () => {
    const props = this.props;
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
    const Conjs = this.props.config.settings.renderConjsAsRadios ? ConjsRadios : ConjsButtons;

    const conjs = <Conjs
      disabled={this.props.children1.size < 2}
      selectedConjunction={this.props.selectedConjunction}
      setConjunction={this.props.setConjunction}
      conjunctionOptions={this.props.conjunctionOptions}
      config={this.props.config}
      not={this.props.not}
      setNot={this.props.setNot}
    />;

    const showDragIcon = this.props.config.settings.canReorder && this.props.treeNodesCnt > 2 && !this.props.isRoot;
    const drag = showDragIcon &&
      <span
        key="group-drag-icon"
        className={"qb-drag-handler group--drag-handler"}
        onMouseDown={this.props.handleDraggerMouseDown}
      ><Icon type="bars" /> </span>;

    return (
      <div className={classNames(
        "group--conjunctions",
        // this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--conj' : ''
      )}>
        {conjs}
        {drag}
      </div>
    );
  }
}


class ConjsButtons extends PureComponent {
  constructor(props) {
    super(props);

    this._setConjunctionHandlers = {};
  }

  _setConjunction = (itemKey, e) => {
    this.props.setConjunction(e, itemKey);
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

  render() {
    const {disabled, not, setNot, conjunctionOptions, config} = this.props;
    return (
      <ButtonGroup
        key="group-conjs-buttons"
        size={config.settings.renderSize || "small"}
        disabled={disabled}
      >
        {config.settings.showNot &&
          <Button
            key={"group-not"}
            onClick={(ev) => setNot(ev, !this.props.not)}
            type={not ? "primary" : null}
          >{config.settings.notLabel}</Button>
        }
        {map(conjunctionOptions, (item, index) => (
          <Button
            disabled={disabled}
            key={item.id}
            type={item.checked ? "primary" : null}
            onClick={this._getSetConjunctionHandler(item.key)}
          >{item.label}</Button>
        ))}
      </ButtonGroup>
    );
  }
}


class ConjsRadios extends PureComponent {
  render() {
    const {disabled, selectedConjunction, setConjunction, conjunctionOptions, config} = this.props;
    return (
      <RadioGroup
        key="group-conjs-radios"
        disabled={disabled}
        value={selectedConjunction}
        size={config.settings.renderSize || "small"}
        onChange={setConjunction}
      >
        {map(conjunctionOptions, (item, index) => (
          <RadioButton
            key={item.id}
            value={item.key}
          //checked={item.checked}
          >{item.label}</RadioButton>
        ))}
      </RadioGroup>
    );
  }
}


class Actions extends PureComponent {
  render() {
    const {config, position, addRule, addGroup, allowFurtherNesting, isRoot, removeSelf} = this.props;

    const immutableGroupsMode = config.settings.immutableGroupsMode;
    const addRuleLabel = config.settings.addRuleLabel || "Add rule";
    const addGroupLabel = config.settings.addGroupLabel || "Add group";
    const delGroupLabel = config.settings.delGroupLabel !== undefined ? config.settings.delGroupLabel : "Delete";

    const addRuleBtn = !immutableGroupsMode &&
      <Button
        key="group-add-rule"
        icon="plus"
        className="action action--ADD-RULE"
        onClick={addRule}
      >{addRuleLabel}</Button>;
    const addGroupBtn = !immutableGroupsMode && allowFurtherNesting &&
      <Button
        key="group-add-group"
        className="action action--ADD-GROUP"
        icon="plus-circle-o"
        onClick={addGroup}
      >{addGroupLabel}</Button>;
    const delGroupBtn = !immutableGroupsMode && !isRoot &&
      <Button
        key="group-del"
        type="danger"
        icon="delete"
        className="action action--DELETE"
        onClick={removeSelf}
      >{delGroupLabel}</Button>;

    return (
      <div className={`group--actions ${position}`}>
        <ButtonGroup
          size={config.settings.renderSize || "small"}
        >
          {addRuleBtn}
          {addGroupBtn}
          {delGroupBtn}
        </ButtonGroup>
      </div>
    )
  }
}

export default Group;

