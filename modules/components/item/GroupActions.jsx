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


export class GroupActions extends PureComponent {
  render() {
    const {
      config, 
      addRule, addGroup, removeSelf, setLock, isLocked, id,
      canAddGroup, canAddRule, canDeleteGroup
    } = this.props;
    const {
      immutableGroupsMode, addRuleLabel, addGroupLabel, delGroupLabel, groupActionsPosition, 
      renderButton: Btn, renderCheckbox: Checkbox, renderButtonGroup: BtnGrp,
      lockLabel, showLock,
    } = config.settings;
    const position = groupActionsPositionList[groupActionsPosition || defaultPosition];

    const setLockSwitch = showLock && <Checkbox 
      type="lock" id={id} value={isLocked} setValue={setLock} label={lockLabel} config={config}
    />;

    const addRuleBtn = !immutableGroupsMode && canAddRule && <Btn
      type="addRule" onClick={addRule} label={addRuleLabel} readonly={isLocked} config={config}
    />;
    const addGroupBtn = !immutableGroupsMode && canAddGroup && <Btn
      type="addGroup" onClick={addGroup} label={addGroupLabel} readonly={isLocked} config={config}
    />;
    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && <Btn
      type="delGroup" onClick={removeSelf} label={delGroupLabel} config={config}
    />;

    return (
      <div className={`group--actions ${position}`}>
        <BtnGrp config={config}>
          {setLockSwitch}
          {addRuleBtn}
          {addGroupBtn}
          {delGroupBtn}
        </BtnGrp>
      </div>
    );
  }
}
