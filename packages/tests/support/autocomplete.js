
import { Utils } from "@react-awesome-query-builder/core";
const { simulateAsyncFetch } = Utils.Autocomplete;
import { expect } from "chai";
import MuiAutocomplete from "@mui/material/Autocomplete";
import MaterialAutocomplete from "@material-ui/lab/Autocomplete";
import { sleep } from "./utils";

//-------

const demoListValues = [
  {title: "A", value: "a"},
  {title: "AA", value: "aa"},
  {title: "AAA1", value: "aaa1"},
  {title: "AAA2", value: "aaa2"},
  {title: "B", value: "b"},
  {title: "C", value: "c"},
  {title: "D", value: "d"},
  {title: "E", value: "e"},
  {title: "F", value: "f"},
  {title: "G", value: "g"},
  {title: "H", value: "h"},
  {title: "I", value: "i"},
  {title: "J", value: "j"},
];

// 10ms delay, 3 per page
export const simulatedAsyncFetch = simulateAsyncFetch(demoListValues, 3, 10);

//-------

export const getAutocompleteUtils = (uif, uifv) => {
  let ctx = {
    qb: undefined,
    ac: undefined,
    multiple: undefined,
    strict: undefined,
    step: undefined,
    ruleNo: undefined,
    selectType: undefined,
  };

  const createCtx = (opts) => {
    const {qb, multiple, strict, ruleNo, selectType} = opts;
    ctx = {
      qb,
      multiple,
      strict,
      ac: undefined,
      step: "init",
      ruleNo,
      selectType: selectType || "value", // or "field"
    };
    updateSelect();
    return ctx;
  };

  const gotoWidget = () => {
    const {qb, ruleNo, selectType} = ctx;
    let res = qb;
    if (ruleNo !== undefined) {
      res = res.find(".rule").at(ruleNo);
    }
    if (selectType === "value") {
      res = res.find(".rule--widget");
    } else {
      res = res.find(".rule--field-wrapper .rule--field");
    }
    return res;
  };

  const setStep = (step) => {
    ctx.step = step;
  };

  const updateSelect = () => {
    const {multiple, selectType} = ctx;
    let ac;

    if (uif === "mui") {
      const Autocomplete = uifv === 4 ? MaterialAutocomplete : MuiAutocomplete;
      ac = gotoWidget().find(Autocomplete);
    } else {
      ac = gotoWidget().find("Select");
    }

    if (selectType === "value") {
      const valuePlaceholder = multiple ? "Select values" : "Select value";
      if (uif === "mui") {
        ac = ac.filter({label: valuePlaceholder});
      } else {
        ac = ac.filterWhere(s => s.props()?.placeholder == valuePlaceholder).last();
      }
    } else {
      ac = ac.last();
    }

    ctx.ac = ac;
  };

  const waitAndUpdate = async ({
    timeout = 100,
    increaseTimeout = 1,
  } = {}) => {
    const finalTimeout = timeout * (increaseTimeout || 1);
    const {qb} = ctx;
    await sleep(finalTimeout); // should be > 50ms delay
    qb.update();
    updateSelect();
  };

  const stringifyOptions = (withValues = true) => {
    const {ac} = ctx;
    if (uif === "mui") {
      const options = ac.prop("options");
      return options.map(({title, value}) => withValues ? `${value}_${title}` : title).join(";");
    } else {
      return stringifyVisibleOptions(withValues);
    }
  };

  const stringifyVisibleOptions = (withValues = false) => {
    const {ac, multiple} = ctx;
    if (uif === "mui") {
      const targetType = !multiple && uifv == 5 ? "div" : "li";
      const options = ac
        .find(".MuiAutocomplete-listbox .MuiAutocomplete-option")
        .filterWhere(o => {
          return o.getElement()?.type == targetType;
        });
      return options.map(o => o.text()).join(";");
    } else {
      const items = ac
        .find("Popup") // in portal
        .find("OptionList")
        .find("Item");
      return items
        .getElements()
        .map((el, i) => 
          withValues && el.key.indexOf("__RC_SELECT_") === -1
            ? `${el.key}_${items.at(i).text()}`
            : `${items.at(i).text()}`
        )
        .join(";");
    }
  };

  const stringifyTags = (withValues = false) => {
    const {ac} = ctx;
    if (uif === "mui") {
      const chips = ac
        .find(".MuiChip-root")
        .filterWhere(o => {
          return o.getElement()?.type == "div";
        });
      return chips
        .map((o, i) => {
          return o.text();
        })
        .join(";");
    } else {
      const items = ac
        .find("Selector")
        .find("Item")
        .filterWhere(o => {
          // last Item contains Input and has no key
          return !!o.key();
        });
      return items
        .getElements()
        .map((el, i) => 
          withValues
            ? `${el.key}_${items.at(i).text()}`
            : `${items.at(i).text()}`
        )
        .join(";");
    }
  };

  const expectInput = (expectedValue) => {
    const {ac, step, multiple} = ctx;
    let textInputValue;
    if (uif === "mui") {
      const textInput = gotoWidget()
        .find(".MuiAutocomplete-root .MuiInput-root input");
      textInputValue = textInput.getDOMNode().getAttribute("value");
    } else {
      const selector = ac.find("Selector");
      const textInput = selector.find("Input");
      // for single - selected title is shown on closed, search value on opened
      //  if "A" is selected and user clicks on search, "" is shown
      textInputValue = !ac.prop("open") && !multiple ? selector.text() : textInput.prop("value");
    }
    expect(textInputValue, `${step} - textInput`).to.eq(expectedValue);
  };

  const expectSelected = (expected) => {
    const {ac, step, multiple} = ctx;
    let actualValue;
    if (uif === "mui") {
      const textInput = gotoWidget()
        .find(".MuiAutocomplete-root .MuiInput-root input");
      actualValue = textInput.getDOMNode().getAttribute("value");
    } else {
      const selector = ac.find("Selector");
      actualValue = selector.text();
    }
    expect(actualValue, `${step} - selected`).to.eq(expected);
  };

  const clickClear = async () => {
    const {ac, step} = ctx;
    if (uif === "mui") {
      const targetType = "button";
      const clearCmp = ac
        .find(".MuiAutocomplete-clearIndicator")
        .filterWhere(o => {
          return o.getElement()?.type == targetType;
        });
      clearCmp.prop("onClick")();
    } else {
      const closeBtn = ac
        .find("Select")
        .find("TransBtn")
        .filterWhere(btn => {
          return btn.props().className?.split(" ").includes("ant-select-clear");
        });
      expect(closeBtn.length, `${step} - closeBtn`).to.eq(1);
      closeBtn.at(0).simulate("mouseDown");
    }
    await waitAndUpdate();
  };

  const expectOptions = (expectedOptions, {withValues = true} = {}) => {
    const {step} = ctx;
    expect(stringifyOptions(withValues), `${step} - options`).to.eq(expectedOptions);
  };

  const expectTags = (expectedTags) => {
    const {step} = ctx;
    expect(stringifyTags(), `${step} - tags`).to.eq(expectedTags);
  };

  const expectVisibleOptions = (expectedOptions, {withValues = false} = {}) => {
    const {step} = ctx;
    expect(stringifyVisibleOptions(withValues), `${step} - visibleOptions`).to.eq(expectedOptions);
  };

  const clickLoadMore = async () => {
    const {qb, ac, step, multiple} = ctx;
    if (uif === "antd") {
      document.querySelector(
        ".ant-select-dropdown .ant-divider"
      )?.nextSibling?.querySelector("a")?.click();
    } else {
      await selectOption("Load more...");
    }
    await waitAndUpdate();
  };

  const selectOption = async (targetTitle, expectedIsSelected = false) => {
    const {ac, step, multiple} = ctx;
    if (uif === "antd") {
      const items = ac
        .find("Popup") // in portal
        .find("OptionList")
        .find("Item");
      const targetItems = items
        .filterWhere(it => it.text() == targetTitle);
        //.filterWhere(it => it.getElement().key == targetValue);
      expect(targetItems.length).to.eq(1);
      //todo: check selected
      targetItems.at(0).simulate("click");
    } else {
      const targetType = !multiple && uifv == 5 ? "div" : "li";
      const options = ac
        .find(".MuiAutocomplete-listbox .MuiAutocomplete-option")
        .filterWhere(o => {
          return o.getElement()?.type == targetType;
        });
      const targetOption = options.filterWhere(o => {
        return o.text().trim() == targetTitle.trim();
      });
      const isSelected = uifv == 5
        ? targetOption.last().getDOMNode().className.includes("Mui-selected")
        : targetOption.last().getDOMNode().getAttribute("aria-selected") == "true";
      if (expectedIsSelected != undefined)
        expect(isSelected, `${step} - ${targetTitle} isSelected`).to.eq(expectedIsSelected);
      targetOption.last().simulate("click");
    }
    await waitAndUpdate();
  };

  const unselectOption = async (targetTitle) => {
    return await selectOption(targetTitle, true);
  };

  const deleteTag = async (targetTitle) => {
    const {ac} = ctx;
    if (uif == "mui") {
      const chips = ac
        .find(".MuiChip-root")
        .filterWhere(o => {
          return o.getElement()?.type == "div";
        });
      const targetChip = chips.findWhere(o => {
        return o.text() == targetTitle;
      });
      const deleteIcon = targetChip
        .find(".MuiChip-deleteIcon");
      deleteIcon.last().simulate("click");
    } else {
      const items = ac
        .find("Selector")
        .find("Item")
        .filterWhere(o => {
          // last Item contains Input and has no key
          return !!o.key();
        });
      const targetItem = items.findWhere(o => {
        return o.text() == targetTitle;
      });
      const deleteIcon = targetItem
        .find("TransBtn");
      deleteIcon.last().simulate("click");
    }

    await waitAndUpdate();
  };

  const openSelect = async () => {
    const {ac} = ctx;
    if (uif == "mui") {
      ac.prop("onOpen")();
      gotoWidget()
        .find(".MuiAutocomplete-root .MuiInput-root input")
        .simulate("click");
    } else {
      ac.prop("onDropdownVisibleChange")(true);
      gotoWidget()
        .find(".ant-select-selection-search input")
        .simulate("click");
    }
    await waitAndUpdate();
  };
  
  const closeSelect = async (opts) => {
    const {ac} = ctx;
    if (uif == "mui") {
      ac.prop("onClose")();
      gotoWidget()
        .find(".MuiAutocomplete-root .MuiInput-root input")
        .simulate("blur");
    } else {
      ac.prop("onDropdownVisibleChange")(false);
      gotoWidget()
        .find(".ant-select-selection-search input")
        .simulate("blur");
    }
    await waitAndUpdate(opts);
  };

  const expectOpened = (expectedOpen = true) => {
    const {ac, step} = ctx;
    const open = ac.prop("open");
    expect(open, `${step} - open`).to.eq(expectedOpen);
  };

  const enterSearch = async (inputValue) => {
    const {ac} = ctx;
    if (uif == "mui") {
      ac.prop("onInputChange")(null, inputValue);
      // gotoWidget()
      //   .find(".MuiAutocomplete-root .MuiInput-root input")
      //   .simulate("change", { target: { value: inputValue } });
    } else {
      ac.prop("onSearch")(inputValue);
    }
    await waitAndUpdate({increaseTimeout: 2});
  };

  return {
    ctx,
    createCtx,
    setStep,
    updateSelect,
    waitAndUpdate,
    expectInput,
    expectSelected,
    clickClear,
    expectOptions,
    expectTags,
    expectVisibleOptions,
    selectOption,
    unselectOption,
    deleteTag,
    openSelect,
    closeSelect,
    expectOpened,
    enterSearch,
    clickLoadMore,
  };
};

//-------
