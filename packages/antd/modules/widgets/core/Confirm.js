import { Modal } from "antd";

const useConfirm = () => {
  return (options) => {
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