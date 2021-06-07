import React, { PureComponent } from "react";

export class RuleGroupExtActions extends PureComponent {
  render() {
    const {config, addRule, canAddRule, canDeleteGroup, removeSelf} = this.props;
    const {
      immutableGroupsMode, addSubRuleLabel, delGroupLabel,
      renderButton: Btn
    } = config.settings;

    const addRuleBtn = !immutableGroupsMode && canAddRule && <Btn 
      type="addRuleGroupExt" onClick={addRule} label={addSubRuleLabel} config={config}
    />;

    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && <Btn 
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config}
    />;

    return (
      <div className={"group--actions group--actions--tr"}>
        {addRuleBtn}
        {delGroupBtn}
      </div>
    );
  }
}
