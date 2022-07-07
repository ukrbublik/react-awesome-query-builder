import React from 'react'; 
import  {IconButton, ActionButton} from "@fluentui/react";

const FluentUIButton=(props)=> {
  var type = props.type,
      label = props.label,
      onClick = props.onClick,
      readonly = props.readonly

  var typeToOnlyIcon = {
    "delGroup": "Delete", 
    "delRuleGroup": "Delete", 
    "delRule": "Delete", 
    "addRuleGroup": "CirclePlus",
  };
  var typeToIcon = {
    "addRule": "Add",
    "addGroup": "CirclePlus", 
    "addRuleGroupExt": "Add",
  };

  if (typeToOnlyIcon[type]) {
    return(
      <IconButton 
      onClick= {onClick}
      disabled={readonly}
      iconProps= {{iconName: typeToOnlyIcon[type] }}
      color='primary'
      />
    )
  } else {
    return(
      <ActionButton
      key={type}
      onClick={onClick}
      iconProps={{iconName: typeToIcon[type] }}
      disabled={readonly} 
      text={label}
      />
    )
  }
};

export default FluentUIButton; 