import BasicGroup from "./BasicGroup";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {ConfirmFn} from "../utils";

@GroupContainer
@Draggable("group")
@ConfirmFn
class Group extends BasicGroup {
}

export default Group;
