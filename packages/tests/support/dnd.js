const createBubbledEvent = (type, props = {}) => {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, props);
  return event;
};
  
export const simulate_drag_n_drop = (sourceRule, targetRule, coords) => {
  const {
    mousePos,
    startMousePos,
    dragRect,
    plhRect,
    treeRect,
    hovRect,
  } = coords;
  const dragHandler = sourceRule.find(".qb-drag-handler").at(0);
  
  dragHandler.simulate(
    "mousedown", 
    createBubbledEvent("mousedown", {
      ...startMousePos, 
      __mocked_window: dragHandler.instance(), 
    })
  );
  const targetContainer = targetRule.closest(".group-or-rule-container");
  targetContainer.instance().getBoundingClientRect = () => hovRect;
  dragHandler.instance().dispatchEvent(
    createBubbledEvent("mousemove", {
      ...mousePos,
      __mock_dom: ({treeEl, dragEl, plhEl}) => {
        treeEl.getBoundingClientRect = () => treeRect;
        dragEl.getBoundingClientRect = () => dragRect;
        plhEl.getBoundingClientRect = () => plhRect;
      },
      __mocked_hov_container: targetContainer.instance(),
    })
  );
  dragHandler.instance().dispatchEvent(
    createBubbledEvent("mouseup", { ...mousePos })
  );
};
