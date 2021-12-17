import React, { PureComponent } from "react";

export class RuleGroupExtActions extends PureComponent {
  render() {
    const {
      config, 
      addRule, canAddRule, canDeleteGroup, removeSelf, 
      setLock, isLocked, isTrueLocked, id,
    } = this.props;
    const {
      immutableGroupsMode, addSubRuleLabel, delGroupLabel,
      renderButton: Btn, renderSwitch: Switch, renderButtonGroup: BtnGrp,
      lockLabel, lockedLabel, showLock, canDeleteLocked,
    } = config.settings;

    const setLockSwitch = showLock && !(isLocked && !isTrueLocked) && <Switch 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} checkedLabel={lockedLabel} config={config}
    />;

    const addRuleBtn = !immutableGroupsMode && canAddRule && !isLocked && <Btn 
      type="addRuleGroupExt" onClick={addRule} label={addSubRuleLabel} readonly={isLocked} config={config}
    />;

    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && (!isLocked || isLocked && canDeleteLocked) && <Btn 
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config}
    />;

    return (
      <div className={"group--actions group--actions--tr"}>
        <BtnGrp config={config}>
          {setLockSwitch}
          {addRuleBtn}
          {delGroupBtn}
        </BtnGrp>
      </div>
    );
  }
}
