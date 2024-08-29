import React, { PureComponent } from "react";

export class RuleGroupExtActions extends PureComponent {
  render() {
    const {
      config, 
      addRule, addGroup, canAddRule, canAddGroup, canDeleteGroup, removeSelf, 
      setLock, isLocked, isTrueLocked, id,
    } = this.props;
    const {
      immutableGroupsMode, addSubRuleLabel, addSubGroupLabel, delGroupLabel,
      renderButton, renderIcon, renderSwitch, renderButtonGroup,
      lockLabel, lockedLabel, showLock, canDeleteLocked,
    } = config.settings;
    const Icon = (pr) => renderIcon(pr, config.ctx);
    const Btn = (pr) => renderButton(pr, config.ctx);
    const Switch = (pr) => renderSwitch(pr, config.ctx);
    const BtnGrp = (pr) => renderButtonGroup(pr, config.ctx);

    const setLockSwitch = showLock && !(isLocked && !isTrueLocked) && <Switch 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} checkedLabel={lockedLabel} config={config}
    />;

    const addSubRuleBtn = !immutableGroupsMode && canAddRule && !isLocked && <Btn 
      type="addSubRule" onClick={addRule} label={addSubRuleLabel} readonly={isLocked} config={config} renderIcon={Icon}
    />;

    const addSubGroupBtn = !immutableGroupsMode && canAddGroup && !isLocked && <Btn
      type="addSubGroup" onClick={addGroup} label={addSubGroupLabel} readonly={isLocked} config={config} renderIcon={Icon}
    />;
  
    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && (!isLocked || isLocked && canDeleteLocked) && <Btn 
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config} renderIcon={Icon}
    />;

    return (
      <div className={"group--actions group--actions--tr"}>
        <BtnGrp config={config}>
          {setLockSwitch}
          {addSubRuleBtn}
          {addSubGroupBtn}
          {delGroupBtn}
        </BtnGrp>
      </div>
    );
  }
}
