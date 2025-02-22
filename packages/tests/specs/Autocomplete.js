import { getAutocompleteUtils } from "../support/autocomplete";
import * as configs from "../support/configs";
import * as inits from "../support/inits";

export const autocompleteTestsFor = (uif, uifv, it, with_qb) => {
  const {
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
  } = getAutocompleteUtils(uif, uifv);

  const testsSingleStrict = (fetchSelectedValuesOnInit = false) => {
    it("should load more, search, close", async () => {
      const configsForTest = [configs.with_autocomplete];
      if (fetchSelectedValuesOnInit) {
        configsForTest.push(configs.with_autocomplete_fetchSelectedValuesOnInit);
      }
      await with_qb(configsForTest, inits.with_autocomplete_strict_a, "JsonLogic", async (qb, {expect_jlogic}) => {
        createCtx({qb, multiple: false, strict: true});
        expectInput("a");
        if (uif === "mui")
          expectOptions("a_a");
    
        // should load A from 1st page
        setStep("wait");
        await waitAndUpdate();
        if (fetchSelectedValuesOnInit) {
          // title should be resolved
          expectInput("A");
          if (uif === "mui")
            expectOptions("a_A");
        } else {
          expectInput("a");
        }
    
        setStep("open");
        await openSelect();
        expectOptions("a_A;aa_AA;aaa1_AAA1");
        expectInput("");
        if (uif == "antd")
          expectSelected("A");
    
        setStep("load more");
        await clickLoadMore();
        expectOptions("a_A;aa_AA;aaa1_AAA1;aaa2_AAA2;b_B;c_C");
        expectOpened(true);

        setStep("search b");
        await enterSearch("b");
        if (uif === "mui") {
          if (fetchSelectedValuesOnInit) {
            expectOptions("a_A;b_B");
          } else {
            expectOptions("a_a;b_B");
          }
        }
        expectVisibleOptions("B");
        expectInput("b");
    
        // setStep("clear");
        // await clickClear();
        // expectInput("");
    
        // should reset
        setStep("close");
        await closeSelect({increaseTimeout: 2});
        expectInput("A");
      }, {
        attach: true
      });
    });
  };


  const testsMultipleStrict = (fetchSelectedValuesOnInit = false) => {
    it("should select, unselect, del tag", async () => {
      const configsForTest = [configs.with_autocomplete];
      if (fetchSelectedValuesOnInit) {
        configsForTest.push(configs.with_autocomplete_fetchSelectedValuesOnInit);
      }
      await with_qb(configsForTest, inits.with_autocomplete_multi_strict_a, "JsonLogic", async (qb, {expect_jlogic}) => {
        createCtx({qb, multiple: true, strict: true});
        expectInput("");
        if (uif === "mui")
          expectOptions("a_a");
        expectTags("a");
    
        setStep("wait");
        await waitAndUpdate();
        if (fetchSelectedValuesOnInit) {
          // title should be resolved
          expectTags("A");
          if (uif === "mui")
            expectOptions("a_A");
        } else {
          expectTags("a");
          if (uif === "mui")
            expectOptions("a_a");
        }

        setStep("open");
        await openSelect();
        expectInput("");
        expectOptions("a_A;aa_AA;aaa1_AAA1");
        expectTags("A");
    
        setStep("select AA");
        await selectOption("AA");
        expectTags("A;AA");
    
        setStep("unselect AA");
        await unselectOption("AA");
        expectTags("A");
    
        setStep("select AA #2");
        await selectOption("AA");
        expectTags("A;AA");
    
        setStep("del tag A");
        await deleteTag("A");
        expectTags("AA");
    
        setStep("clear");
        await clickClear();
        expectInput("");
        expectTags("");
    
        // setStep("search b");
        // await enterSearch("b");
        // expectOptions("a_a;b_B");
        // expectVisibleOptions("B");
    
        // setStep("close");
        // await closeSelect();
        // expectInput("");
      }, {
        attach: true
      });
    });
  };


  return {
    testsSingleStrict,
    testsMultipleStrict,
  };
};
