import React, { PureComponent } from "react";

export class RuleGroupActions extends PureComponent {
  render() {
    const {
      config, 
      addRule, canAddRule, canDeleteGroup, removeSelf, 
      setLock, isLocked, id,
    } = this.props;
    const {
      immutableGroupsMode, addRuleLabel, delGroupLabel,
      renderButton: Btn, renderCheckbox: Checkbox,
      lockLabel, showLock,
    } = config.settings;

    const setLockSwitch = showLock && <Checkbox 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} config={config}
    />;

    const addRuleBtn = !immutableGroupsMode && canAddRule && <Btn 
      type="addRuleGroup" onClick={addRule} label={addRuleLabel} readonly={isLocked} config={config}
    />;

    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && <Btn 
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config}
    />;

    return (
      <div className={"group--actions"}>
        {setLockSwitch}
        {addRuleBtn}
        {delGroupBtn}
      </div>
    );
  }
}
