import { Modal } from 'antd';
const { confirm } = Modal;

export default (options = {onOk, okText, cancelText, title}) => {
  confirm(options);
}
