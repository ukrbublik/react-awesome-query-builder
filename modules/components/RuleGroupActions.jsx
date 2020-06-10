import React, { PureComponent } from "react";

export class RuleGroupActions extends PureComponent {
  render() {
    const {config, addRule, canAddRule, canDeleteGroup, removeSelf} = this.props;
    const {
      immutableGroupsMode, addRuleLabel, delGroupLabel,
      renderButton: Btn
    } = config.settings;

    const addRuleBtn = !immutableGroupsMode && canAddRule && <Btn 
      type="addRuleGroup" onClick={addRule} label={addRuleLabel} config={config}
    />;

    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && <Btn 
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config}
    />;

    return (
      <div className={"group--actions"}>
        {addRuleBtn}
        {/*delGroupBtn*/}
      </div>
    );
  }
}
