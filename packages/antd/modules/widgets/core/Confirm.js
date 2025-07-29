import { Modal } from "antd";

const useConfirm = () => {
  return (options) => {
    // TODO: Replace Modal.confirm with dynamic modal rendering (AntD v5)
    Modal.confirm(options);
  };
};

const Confirm = ({confirmFn, ...renderOptions}) => {
  confirmFn(renderOptions);
};

export {
  useConfirm,
  Confirm
};