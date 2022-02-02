export default ({onOk, okText, cancelText, title, confirmFn}) => {
  confirmFn({ 
    description: title || "Are you sure?",
    title: null,
    confirmationText: okText || "Ok",
    cancellationText: cancelText || "Cancel",
  })
    .then(onOk)
    .catch(() => {});
};
