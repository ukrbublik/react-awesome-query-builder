import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import map from 'lodash/map';
import GroupContainer from './containers/GroupContainer';
import { Row, Col, Icon, Button, Radio } from 'antd';
const ButtonGroup = Button.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const classNames = require('classnames');

@GroupContainer
export default class Group extends Component {
  static propTypes = {
    conjunctionOptions: PropTypes.object.isRequired,
    addRule: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    allowFurtherNesting: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    selectedConjunction: PropTypes.string,
    setConjunction: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
  };

  shouldComponentUpdate = shallowCompare;


    handleDraggerMouseDown (e) {
        var nodeId = this.props.id;
        var dom = this.refs.group;
        if (this.props.onDragStart) {
          this.props.onDragStart(nodeId, dom, e);
        }
    }

  render() {
    let renderConjsAsRadios = false;

    let styles = {};
    if (this.props.renderType == 'dragging') {
        styles = {
            top: this.props.dragging.y,
            left: this.props.dragging.x,
            width: this.props.dragging.w
        };
    }

    return (
      <div
        className={classNames("group", "group-or-rule",
            this.props.renderType == 'placeholder' ? 'qb-placeholder' : null,
            this.props.renderType == 'dragging' ? 'qb-draggable' : null,
        )}
        style={styles}
        ref="group"
        data-id={this.props.id}
      >
        <div className="group--header">
          <div className={classNames(
            "group--conjunctions",
            this.props.children.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--conj' : ''
          )}>
            { this.props.config.settings.renderConjsAsRadios ?
              <RadioGroup
                 disabled={this.props.children.size < 2}
                 value={this.props.selectedConjunction}
                 size={this.props.config.settings.renderSize || "small"}
                 onChange={this.props.setConjunction}
              >
              {map(this.props.conjunctionOptions, (item, index) => (
                <RadioButton
                  value={item.key}
                  //checked={item.checked}
                >{item.label}</RadioButton>
              ))}
              </RadioGroup>
            :
              <ButtonGroup
                size={this.props.config.settings.renderSize || "small"}
                disabled={this.props.children.size < 2}
              >
              {map(this.props.conjunctionOptions, (item, index) => (
                <Button
                  disabled={this.props.children.size < 2}
                  key={item.id}
                  type={item.checked ? "primary" : null}
                  onClick={(ev) => this.props.setConjunction(ev, item.key)}
                >{item.label}</Button>
              ))}
              </ButtonGroup>
            }
            { this.props.config.settings.canReorder && this.props.treeNodesCnt > 2 && !this.props.isRoot &&
                <span className={"qb-drag-handler"} onMouseDown={this.handleDraggerMouseDown.bind(this)} > <Icon type="bars" /> </span>
            }
          </div>
          <div className="group--actions">
            <ButtonGroup
              size={this.props.config.settings.renderSize || "small"}
            >
                <Button
                  icon="plus"
                  className="action action--ADD-RULE"
                  onClick={this.props.addRule}
                >{this.props.config.settings.addRuleLabel || "Add rule"}</Button>
                {this.props.allowFurtherNesting ? (
                  <Button
                    className="action action--ADD-GROUP"
                    icon="plus-circle-o"
                    onClick={this.props.addGroup}
                  >{this.props.config.settings.addGroupLabel || "Add group"}</Button>
                ) : null}
                {!this.props.isRoot ? (
                  <Button
                    type="danger"
                    icon="delete"
                    className="action action--ADD-DELETE"
                    onClick={this.props.removeSelf}
                  >{this.props.config.settings.delGroupLabel !== undefined ? this.props.config.settings.delGroupLabel : "Delete"}</Button>
                ) : null}
            </ButtonGroup>
          </div>
        </div>
        {this.props.children ? (
          <div className={classNames(
            "group--children",
            this.props.children.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--line' : ''
          )}>{this.props.children}</div>
        ) : null}
      </div>
    );
  }
}
