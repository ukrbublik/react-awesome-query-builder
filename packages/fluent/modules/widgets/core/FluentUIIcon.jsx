import React from "react";
import { Icon } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { DragIcon } = Utils;

const typeToIcon = {
  addSubRuleSimple: "CirclePlus",
  addSubRule: "Add",
  addSubGroup: "CirclePlus",
  addRule: "Add",
  addGroup: "CirclePlus",
  delGroup: "Delete",
  delRuleGroup: "Delete",
  delRule: "Delete",
  drag: "GripperBarHorizontal",
};

const FluentUIIcon = ({ type, readonly, renderBtn, renderDefaultButton }) => {
  const iconName = typeToIcon[type];
  if (!iconName && type === "drag") {
    return <DragIcon />;
  } else if (!typeToIcon[type]) {
    return renderDefaultButton({});
  } else if (renderBtn) {
    return renderBtn({
      iconProps: {
        iconName: typeToIcon[type],
      }
    });
  } else {
    return (
      <Icon
        key={type}
        disabled={readonly}
        iconName={typeToIcon[type]}
        color="primary"
      />
    );
  }
};

export default FluentUIIcon;
