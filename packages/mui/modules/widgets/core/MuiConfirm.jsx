import { useConfirm } from "material-ui-confirm";

export const MuiUseConfirm = function () {
  const confirmFn = useConfirm();
  return ({okText, cancelText, title, onOk}) => {
    confirmFn({
      description: title || "Are you sure?",
      title: null,
      confirmationText: okText || "Ok",
      cancellationText: cancelText || "Cancel",
    })
      .then(onOk)
      .catch(() => {});
  };
};

export const MuiConfirm = ({confirmFn, ...renderOptions}) => {
  confirmFn(renderOptions);
};
