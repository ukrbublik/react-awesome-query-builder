import React, { useState } from "react";

interface JSONEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonString: string) => void;
  initialValue?: string;
}

const JSONEditorModal: React.FC<JSONEditorModalProps> = ({
  isOpen,
  onClose,
  onImport,
  initialValue = ""
}) => {
  const [jsonInput, setJsonInput] = useState(initialValue);
  const [isSelecting, setIsSelecting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleImport = () => {
    onImport(jsonInput);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't close modal if user is selecting text
    if (e.target === e.currentTarget && !isSelecting) {
      onClose();
    }
  };

  const handleMouseDown = () => {
    setIsSelecting(true);
  };

  const handleMouseUp = () => {
    // Delay resetting isSelecting to allow for text selection completion
    setTimeout(() => setIsSelecting(false), 100);
  };

  return (
    <div 
      className="json-editor-modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
    >
      <div 
        className="json-editor-modal-content"
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "80%",
          maxWidth: "800px",
          height: "70vh",
          maxHeight: "600px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          overflow: "hidden"
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "bold" }}>
            JSON Logic Editor
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
            Enter your JsonLogic expression below:
          </p>
        </div>
        
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          minHeight: 0,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            placeholder={"{\"and\": [{\"==\": [{\"var\": \"name\"}, \"John\"]}, {\">\": [{\"var\": \"age\"}, 18]}]}"}
            style={{
              width: "calc(100% - 24px)",
              height: "calc(100% - 40px)",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              resize: "none",
              marginBottom: "20px",
              minHeight: "200px",
              outline: "none",
              lineHeight: "1.5",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "white",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#007acc",
              color: "white",
              cursor: "pointer"
            }}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default JSONEditorModal;
