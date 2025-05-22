import React from "react";
import { Modal } from "antd";

const { confirm } = Modal;

export const useConfirm = () => {
  return (options) => {
    confirm(options);
  };
};

export const Confirm = ({confirmFn, ...renderOptions}) => {
  confirmFn(renderOptions);
};
