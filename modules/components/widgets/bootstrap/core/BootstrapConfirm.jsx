export default ({onOk, okText, cancelText, title}) => {
  if (confirm(title)) {
    onOk();
  }
};
