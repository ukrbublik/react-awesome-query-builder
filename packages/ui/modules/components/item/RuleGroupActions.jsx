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
      renderButton, renderIcon, renderSwitch, renderButtonGroup,
      lockLabel, lockedLabel, showLock, canDeleteLocked,
    } = config.settings;
    const Icon = (pr) => renderIcon(pr, config.ctx);
    const Btn = (pr) => renderButton(pr, config.ctx);
    const Switch = (pr) => renderSwitch(pr, config.ctx);
    const BtnGrp = (pr) => renderButtonGroup(pr, config.ctx);

    const setLockSwitch = showLock && !(isLocked && !isTrueLocked) && <Switch 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} checkedLabel={lockedLabel} hideLabel={true} config={config}
    />;

    const addRuleBtn = !immutableGroupsMode && canAddRule && !isLocked && <Btn 
      type="addRuleGroup" onClick={addRule} label={addRuleLabel} readonly={isLocked} config={config} renderIcon={Icon}
    />;

    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && (!isLocked || isLocked && canDeleteLocked) && <Btn 
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config} renderIcon={Icon}
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
