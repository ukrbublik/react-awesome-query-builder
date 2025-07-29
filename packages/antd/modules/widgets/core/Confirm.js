import { Modal } from "antd";

const useConfirm = () => {
  return (options) => {
    // TODO(antd5): replace Modal.confirm with dynamically rendered modal
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