import React, { useState } from "react";
import { IconButton, ActionButton, CommandBarButton, DefaultButton } from "@fluentui/react";
import JSONEditorModal from './JSONEditorModal';

const hideLabelsFor = {
  "addSubRuleSimple": true,
  "delRuleGroup": true,
  "delRule": true,  
  // "addSubRule": true,
  // "addSubGroup": true,
  // "delGroup": true,
};
const useAction = {
  "addSubRuleSimple": true,
};

const FluentUIButton = (props) => {
  const { type, label, onClick, readonly, renderIcon, config } = props;
  const [isModalOpen, setModalOpen] = useState(false);

  const handleButtonClick = () => {
    setModalOpen(true);
  };

  const handleModalDismiss = () => {
    setModalOpen(false);
  };

  let renderBtn;
  if (!label || hideLabelsFor[type]) {
    renderBtn = (bprops) => (
      <IconButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        color="primary"
        {...bprops}
      />
    );
  } else if (useAction[type]) {
    renderBtn = (bprops) => (
      <ActionButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        {...bprops}
      />
    );
  } else {
    renderBtn = (bprops) => (
      <CommandBarButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        {...bprops}
      />
    );
  }

  const iconProps = {
    type,
    readonly,
    config,
    renderBtn,
  };
  const buttonIcon = renderIcon?.(iconProps);

  return (
    <div>
      {buttonIcon}
      {renderBtn({})}
      <JSONEditorButton onClick={handleButtonClick} />
      <JSONEditorModal isOpen={isModalOpen} onDismiss={handleModalDismiss} />
    </div>
  );
};

const JSONEditorButton = ({ onClick }) => (
  <DefaultButton
    text="Open JSON Editor"
    onClick={onClick}
    style={{ marginTop: '10px' }}
  />
);

export { FluentUIButton, JSONEditorButton };
export default FluentUIButton;
