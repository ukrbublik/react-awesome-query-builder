import React, { createContext, useContext } from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { ConfirmModalProps } from "@react-awesome-query-builder/ui";

export type ConfirmOptions = Omit<ConfirmModalProps, "onOk" | "confirmFn">;

type ModalProps = { modalOpened?: boolean };
type ModalInstance = React.FC<ModalProps>;

interface FluentUIConfirmContextOptions {
  showModal: (modalInstanceFn: () => ModalInstance) => void;
  closeModal: () => void;
}

const FluentUIConfirmContext = createContext<FluentUIConfirmContextOptions>({
  showModal: () => void 0,
  closeModal: () => void 0,
});

export const FluentUIConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [Modal, setModal] = React.useState<ModalInstance | null>(null);
  const [modalOpened, setModalOpened] = React.useState<boolean>(false);

  const showModal = (modalInstanceFn: () => ModalInstance) => {
    setModalOpened(true);
    setModal(modalInstanceFn);
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

  const confirmFn = (options: ConfirmOptions) => {
    return new Promise<void>((resolve, reject) => {
      const onOk = () => {
        closeModal();
        resolve();
      };
      const onCancel = () => {
        closeModal();
        reject(new Error("Cancelled"));
      };
      showModal(() => ({ modalOpened }: ModalProps) => {
        return (
          <Dialog
            hidden={!modalOpened}
            onDismiss={onCancel}
            dialogContentProps={{
              type: DialogType.normal,
              title: options.title ?? "Are you sure?",
              styles: {
                title: { fontSize: "1.5rem" },
                inner: { paddingBottom: 0, marginTop: "20px" },
              },
            }}
          >
            <DialogFooter>
              <PrimaryButton onClick={onOk} text={options.okText} />
              <DefaultButton onClick={onCancel} text={options.cancelText} />
            </DialogFooter>
          </Dialog>
        );
      });
    });
  };

  return confirmFn;
};

export const FluentUIConfirm = (props: ConfirmModalProps) => {
  const {onOk, confirmFn, ...renderOptions} = props;
  confirmFn?.(renderOptions)
    .then(onOk)
    .catch(() => {});
};

