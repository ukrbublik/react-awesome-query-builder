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
      renderButton: Btn, renderSwitch: Switch, renderButtonGroup: BtnGrp,
      lockLabel, lockedLabel, showLock,
    } = config.settings;
    const position = groupActionsPositionList[groupActionsPosition || defaultPosition];

    const setLockSwitch = showLock && !(isLocked && !isTrueLocked) && <Switch 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} checkedLabel={lockedLabel} config={config}
    />;

    const addCaseGroupBtn = !immutableGroupsMode && canAddGroup && !isLocked && <Btn
      type="addCaseGroup" onClick={addCaseGroup} label={addCaseLabel} readonly={isLocked} config={config}
    />;

    const addDefaultCaseGroupBtn = !immutableGroupsMode && canAddDefault && !isLocked && <Btn
      type="addDefaultCaseGroup" onClick={addDefaultCaseGroup} label={addDefaultCaseLabel} readonly={isLocked} config={config}
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
