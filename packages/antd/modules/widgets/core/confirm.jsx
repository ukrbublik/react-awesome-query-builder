import React from "react";
import { Modal } from "antd";

const { confirm } = Modal;

const useConfirm = () => {
  return (options) => {
    confirm(options);
  };
};

const Confirm = ({confirmFn, ...renderOptions}) => {
  confirmFn(renderOptions);
};

export {
  useConfirm,
  Confirm
};