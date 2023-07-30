import React, { PureComponent } from "react";

const groupActionsPositionList = {
  topLeft: "group--actions--tl",
  topCenter: "group--actions--tc",
  topRight: "group--actions--tr",
  bottomLeft: "group--actions--bl",
  bottomCenter: "group--actions--bc",
  bottomRight: "group--actions--br"
};
const defaultPosition = "topRight";


export class SwitchGroupActions extends PureComponent {
  render() {
    const {
      config, 
      addCaseGroup, addDefaultCaseGroup, setLock, isLocked, isTrueLocked, id, canAddGroup, canAddDefault
    } = this.props;
    const {
      immutableGroupsMode, addCaseLabel, addDefaultCaseLabel, groupActionsPosition, 
      renderButton, renderIcon, renderSwitch, renderButtonGroup,
      lockLabel, lockedLabel, showLock,
    } = config.settings;
    const Icon = (pr) => renderIcon(pr, config.ctx);
    const Btn = (pr) => renderButton(pr, config.ctx);
    const Switch = (pr) => renderSwitch(pr, config.ctx);
    const BtnGrp = (pr) => renderButtonGroup(pr, config.ctx);
    const position = groupActionsPositionList[groupActionsPosition || defaultPosition];

    const setLockSwitch = showLock && !(isLocked && !isTrueLocked) && <Switch 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} checkedLabel={lockedLabel} config={config}
    />;

    const addCaseGroupBtn = !immutableGroupsMode && canAddGroup && !isLocked && <Btn
      type="addCaseGroup" onClick={addCaseGroup} label={addCaseLabel} readonly={isLocked} config={config} renderIcon={Icon}
    />;

    const addDefaultCaseGroupBtn = !immutableGroupsMode && canAddDefault && !isLocked && <Btn
      type="addDefaultCaseGroup" onClick={addDefaultCaseGroup} label={addDefaultCaseLabel} readonly={isLocked} config={config} renderIcon={Icon}
    />;

    return (
      <div className={`group--actions ${position}`}>
        <BtnGrp config={config}>
          {setLockSwitch}
          {addCaseGroupBtn}
          {addDefaultCaseGroupBtn}
        </BtnGrp>
      </div>
    );
  }
}
