import React, { PureComponent } from "react";

export class RuleGroupActions extends PureComponent {
  render() {
    const {
      config, 
      addRule, canAddRule, canDeleteGroup, removeSelf, 
      setLock, isLocked, isTrueLocked, id,
    } = this.props;
    const {
      immutableGroupsMode, addRuleLabel, delGroupLabel,
      renderButton: Btn, renderSwitch: Switch, renderButtonGroup: BtnGrp,
      lockLabel, lockedLabel, showLock, canDeleteLocked,
    } = config.settings;

    const setLockSwitch = showLock && !(isLocked && !isTrueLocked) && <Switch 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} checkedLabel={lockedLabel} hideLabel={true} config={config}
    />;

    const addRuleBtn = !immutableGroupsMode && canAddRule && !isLocked && <Btn 
      type="addRuleGroup" onClick={addRule} label={addRuleLabel} readonly={isLocked} config={config}
    />;

    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && (!isLocked || isLocked && canDeleteLocked) && <Btn 
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config}
    />;

    return (
      <div className={"group--actions"}>
        <BtnGrp config={config}>
          {setLockSwitch}
          {addRuleBtn}
          {delGroupBtn}
        </BtnGrp>
      </div>
    );
  }
}
