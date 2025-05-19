import React, { createContext, useContext } from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { ConfirmModalProps } from "@react-awesome-query-builder/ui";

export type ConfirmOptions  = Omit<ConfirmModalProps, "onOk" | "confirmFn">;

type ModalInstanceType = React.ComponentClass<ConfirmOptions> | React.FunctionComponent<ConfirmOptions>;

interface FluentUIConfirmContextOptions {
  showModal: (modalInstance: ModalInstanceType) => void;
  closeModal: () => void;
}

const FluentUIConfirmContext = createContext<FluentUIConfirmContextOptions>({
  showModal: () => void 0,
  closeModal: () => void 0,
});

export const FluentUIConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalInstance, setModalInstance] = React.useState<ModalInstanceType | null>(null);

  const showModal = (instance: ModalInstanceType) => {
    setModalInstance(instance);
  };

  const closeModal = () => {
    setModalInstance(null);
  };

  return (
    <FluentUIConfirmContext.Provider value={{ showModal, closeModal }}>
      {children}
      {modalInstance && modalInstance}
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

const FluentUIUseConfirm = () => {
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
      showModal(() => (
        <Dialog
          hidden={false}
          onDismiss={onCancel}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: options.title ?? undefined,
          }}
        >
          <DialogFooter>
            <PrimaryButton onClick={onOk} text={options.okText} />
            <DefaultButton onClick={onCancel} text={options.cancelText} />
          </DialogFooter>
        </Dialog>
      ));
    });
  };

  return confirmFn;
};

const FluentUIConfirm = (props: ConfirmModalProps) => {
  const {onOk, confirmFn, ...renderOptions} = props;
  confirmFn?.(renderOptions)
    .then(onOk)
    .catch(() => {});
};

export { FluentUIConfirm, FluentUIUseConfirm };
