import React, { PureComponent } from "react";
import Operator from "./Operator";
import {Col} from "../utils";


export default class OperatorWrapper extends PureComponent {
  render() {
    const {
      config, selectedField, selectedOperator, setOperator, 
      selectedFieldPartsLabels, showOperator, showOperatorLabel, selectedFieldWidgetConfig, readonly, id, groupId
    } = this.props;
    const operator = showOperator
            && <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
              { config.settings.showLabels
                    && <label className="rule--label">{config.settings.operatorLabel}</label>
              }
              <Operator
                key="operator"
                config={config}
                selectedField={selectedField}
                selectedOperator={selectedOperator}
                setOperator={setOperator}
                readonly={readonly}
                id={id}
                groupId={groupId}
              />
            </Col>;
    const hiddenOperator = showOperatorLabel
            && <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
              <div className="rule--operator-wrapper">
                {config.settings.showLabels
                  ? <label className="rule--label">&nbsp;</label>
                  : null}
                <div className="rule--operator-text-wrapper">
                  <span className="rule--operator-text">{selectedFieldWidgetConfig.operatorInlineLabel}</span>
                </div>
              </div>
            </Col>;
    return [
      operator,
      hiddenOperator
    ];
  }
}
