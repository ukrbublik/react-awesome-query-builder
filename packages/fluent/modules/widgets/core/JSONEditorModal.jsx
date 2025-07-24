import React, { useState } from 'react';
import { Modal, TextField, DefaultButton } from '@fluentui/react';
import { _loadFromJsonLogic } from '../../../../core/modules/import/jsonLogic';

const JSONEditorModal = ({ isOpen, onDismiss }) => {
  const [jsonInput, setJsonInput] = useState('');

  const handleImport = () => {
    try {
      const jsonLogic = JSON.parse(jsonInput);
      const result = _loadFromJsonLogic(jsonLogic, {}); // Assuming config is an empty object for now
      console.log('Import Result:', result);
      onDismiss();
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      isBlocking={false}
    >
      <div style={{ padding: '20px' }}>
        <h2>JSON Editor</h2>
        <TextField
          label="Enter JSON Logic"
          multiline
          rows={10}
          onChange={(e, newValue) => setJsonInput(newValue || '')}
        />
        <DefaultButton
          text="Import"
          onClick={handleImport}
          style={{ marginTop: '10px' }}
        />
      </div>
    </Modal>
  );
};

export default JSONEditorModal;
