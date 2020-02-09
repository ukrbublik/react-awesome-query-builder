import React, { PureComponent } from 'react';
import { Button } from 'antd';


export class RuleGroupActions extends PureComponent {
  render() {
    const {config: {settings}, addRule, canAddRule, canDeleteGroup, removeSelf} = this.props;
    const {immutableGroupsMode, addRuleLabel, delGroupLabel, renderSize} = settings;
    const _addRuleLabel = "";

    const addRuleBtn = !immutableGroupsMode && canAddRule &&
      <Button
        key="group-add-rule"
        icon="plus"
        className="action action--ADD-RULE"
        onClick={addRule}
        size={renderSize}
      >{_addRuleLabel}</Button>;
      
    const delGroupBtn = !immutableGroupsMode && canDeleteGroup &&
      <Button
        key="group-del"
        type="danger"
        icon="delete"
        className="action action--DELETE"
        size={renderSize}
        onClick={removeSelf}
      >{delGroupLabel}</Button>;

    return (
      <div className={`group--actions`}>
        {addRuleBtn}
        {/*delGroupBtn*/}
      </div>
    )
  }
}
