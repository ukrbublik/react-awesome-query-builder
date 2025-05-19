import React, { createContext, useContext } from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { ConfirmModalProps } from "@react-awesome-query-builder/ui";

type ModalProps = { modalOpened?: boolean };
type ModalComp = React.FC<ModalProps>;

interface FluentUIConfirmContextOptions {
  showModal: (modal: () => ModalComp) => void;
  closeModal: () => void;
}

const FluentUIConfirmContext = createContext<FluentUIConfirmContextOptions>({
  showModal: () => void 0,
  closeModal: () => void 0,
});

export const FluentUIConfirmProvider = ({ children }: { children: React.ReactNode }) => {
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
    <FluentUIConfirmContext.Provider value={{ showModal, closeModal }}>
      {children}
      {Modal && <Modal modalOpened={modalOpened}/>}
    </FluentUIConfirmContext.Provider>
  );
};

export const useFluentUIConfirm = () => {
  const context = useContext(FluentUIConfirmContext);
  if (!context) {
    throw new Error("useFluentUIConfirm must be used within a FluentUIConfirmProvider");
  }
  return context;
};

export const FluentUIUseConfirm = () => {
  const { showModal, closeModal } = useFluentUIConfirm();

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
        <Dialog
          hidden={modalOpened === undefined ? false : !modalOpened}
          onDismiss={onClickCancel}
          dialogContentProps={{
            type: DialogType.normal,
            title: title ?? "Are you sure?",
            styles: {
              title: { fontSize: "1.5rem" },
              inner: { paddingBottom: 0, marginTop: "20px" },
            },
          }}
        >
          <DialogFooter>
            <PrimaryButton onClick={onClickOk} text={okText} />
            <DefaultButton onClick={onClickCancel} text={cancelText} />
          </DialogFooter>
        </Dialog>
      );
    });
  };

  return confirmFn;
};

export const FluentUIConfirm = ({confirmFn, ...renderOptions}: ConfirmModalProps) => {
  confirmFn?.(renderOptions);
};
