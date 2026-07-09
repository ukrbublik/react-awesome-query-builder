import React, { createContext, useContext } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { ConfirmModalProps } from "@react-awesome-query-builder/ui";

type ModalProps = { modalOpened?: boolean };
type ModalComp = React.FC<ModalProps>;

interface BootstrapConfirmContextOptions {
  showModal: (modal: () => ModalComp) => void;
  closeModal: () => void;
}

const BootstrapConfirmContext = createContext<BootstrapConfirmContextOptions>({
  showModal: () => void 0,
  closeModal: () => void 0,
});

export const BootstrapConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [Modal, setModal] = React.useState<ModalComp | null>(null);
  const [modalOpened, setModalOpened] = React.useState<boolean>(false);

  const showModal = (modal: () => ModalComp) => {
    setModalOpened(true);
    setModal(modal);
  };

  const closeModal = () => {
    setModalOpened(false);
    setTimeout(() => {
      setModal(null);
    }, 300);
  };

  return (
    <BootstrapConfirmContext.Provider value={{ showModal, closeModal }}>
      {children}
      {Modal && <Modal modalOpened={modalOpened}/>}
    </BootstrapConfirmContext.Provider>
  );
};

export const useBootstrapConfirm = () => {
  const context = useContext(BootstrapConfirmContext);
  if (!context) {
    throw new Error("useBootstrapConfirm must be used within a BootstrapConfirmProvider");
  }
  return context;
};

export const BootstrapUseConfirm = () => {
  const { showModal, closeModal } = useBootstrapConfirm();

  const confirmFn = ({title, okText, cancelText, onOk}: ConfirmModalProps) => {
    const onClickOk = () => {
      closeModal();
      onOk?.();
    };
    const onClickCancel = () => {
      closeModal();
    };
    showModal(() => ({ modalOpened }: ModalProps = {}) => {
      return (
        <Modal
          isOpen={modalOpened === undefined ? true : modalOpened}
          toggle={closeModal}
        >
          <ModalBody>
            {title}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={onClickOk}>
              {okText}
            </Button>
            <Button color="secondary" onClick={onClickCancel}>
              {cancelText}
            </Button>
          </ModalFooter>
        </Modal>
      );
    });
  };

  return confirmFn;
};

export const BootstrapConfirm = ({confirmFn, ...renderOptions}: ConfirmModalProps) => {
  confirmFn?.(renderOptions);
};
