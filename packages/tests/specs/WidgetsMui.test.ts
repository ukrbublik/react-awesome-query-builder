import moment from "moment";
import { expect } from "chai";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_mui, hexToRgbString } from "../support/utils";
import { getAutocompleteUtils } from "../support/autocomplete";
import Select, { SelectChangeEvent } from "@material-ui/core/Select";

const ignoreLogDatePicker = (errText: string) => {
  return errText.includes("The `anchorEl` prop provided to the component is invalid");
};

describe("mui theming", () => {
  it("applies secondary color", async () => {
    await with_qb_mui(configs.with_theme_mui, inits.with_bool, "JsonLogic", (qb) => {
      const boolSwitch = qb.find(".rule--value .MuiSwitch-thumb");
      // for some reason elements are duplicated for MUI
      expect(boolSwitch, "boolSwitch").to.have.length(2);
      const boolSwitchNode = boolSwitch.at(1).getDOMNode();
      const boolSwitchStyle = getComputedStyle(boolSwitchNode);
      expect(boolSwitchStyle.getPropertyValue("color"), "boolSwitch color").to.eq(hexToRgbString("#5e00d7"));
    }, {
      attach: true
    });
  });
});

describe("mui core widgets", () => {
  it("change field with autocomplete", async () => {
    await with_qb_mui(configs.with_struct, inits.with_nested, "JsonLogic", async (qb) => {
      const {
        createCtx,
        setStep,
        expectInput,
        expectOptions,
        expectVisibleOptions,
        selectOption,
        openSelect,
        enterSearch,
        expectOpened,
      } = getAutocompleteUtils("mui", 5);
      createCtx({qb, selectType: "field"});
      expectInput("firstName");
      await openSelect();
      expectOptions("login;firstName", {withValues: false});
      expectVisibleOptions("  login;    firstName", {withValues: false});
      await selectOption("firstName");
      expectInput("firstName");
      await openSelect();
      await selectOption("login");
      expectInput("login");
      await openSelect();
      await enterSearch("first");
      expectInput("first");
      expectOpened(true);
      expectVisibleOptions("    firstName", {withValues: false});
    }, {
      ignoreLog: ignoreLogDatePicker,
    });
  });

  it("change field without autocomplete", async () => {
    await with_qb_mui([configs.with_struct, configs.without_field_autocomplete], inits.with_nested, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const sel = qb.find(".rule--field").find(Select).last();
      sel.prop("onChange")?.({target: {value: "user.login"}} as SelectChangeEvent, null);
      qb.update();
      
      expect_jlogic([null,
        {
          "and": [
            { "==": [ { "var": "user.login" }, "abc" ] },
          ]
        }
      ]);
    }, {
      ignoreLog: ignoreLogDatePicker,
    });
  });
});

describe("mui widgets interactions", () => {

  it("change date", async () => {
    await with_qb_mui(configs.with_date_and_time, inits.with_date_and_time, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      // open date picker for '2020-05-18'
      const openPickerBtn = qb.find(".rule--widget--DATE button.MuiIconButton-root");
      const dateInput = qb.find(".rule--widget--DATE input.MuiInput-input");
      expect(dateInput, "dateInput").to.have.length(1);
      if (openPickerBtn.length) {
        // desktop mode
        openPickerBtn.simulate("click");
      } else {
        // mobile mode
        // should not happen, see `desktopModeMediaQuery`
        dateInput.simulate("click");
      }

      // click on 3rd week, 2nd day of week (should be sunday, 10 day for default US locale)
      let dayBtn;
      // v6
      dayBtn = document.querySelector<HTMLElement>(
        ".MuiDateCalendar-root" 
        + " .MuiDayCalendar-monthContainer"
        + " .MuiDayCalendar-weekContainer:nth-child(3)" 
        + " > .MuiPickersDay-root:nth-child(2)" 
      );
      // v5
      if (!dayBtn) {
        dayBtn = document.querySelector<HTMLElement>(
          ".MuiCalendarPicker-root" 
          + " .MuiDayPicker-monthContainer"
          + " .MuiDayPicker-weekContainer:nth-child(3)" 
          + " > .MuiPickersDay-root:nth-child(2)" 
        );
      }
      expect(dayBtn, "dayBtn").to.exist;
      expect(dayBtn?.innerText, "dayBtn").to.eq("11");
      dayBtn?.click();

      // now input should be '2020-05-11'
      const dateInputValue = dateInput.getDOMNode().getAttribute("value");
      expect(dateInputValue, "dateInputValue").to.eq("11.05.2020");

      expect_jlogic([null,
        {
          "or": [{
            "==": [ { "var": "datetime" }, "2020-05-18T21:50:01.000Z" ]
          }, {
            "and": [{
              "==": [ {  "var": "date" }, "2020-05-11T00:00:00.000Z" ]
            }, {
              "==": [ { "var": "time" }, 3000 ]
            }]
          }]
        }
      ]);
    }, {
      ignoreLog: ignoreLogDatePicker,
    });
  });

  it("change time value", async function() {
    await with_qb_mui(configs.with_all_types, inits.with_time, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const timeInput = qb.find(".rule--widget--TIME input.MuiInput-input");
      expect(timeInput, "timeInput").to.have.length(1);
      timeInput.simulate("click");
      const clockPicker = document.querySelector<HTMLElement>(".MuiClockPicker-root");
      const clockBtn = qb.find(".rule--widget--TIME .MuiInputAdornment-root .MuiButtonBase-root");
      let changeIndex = 0;
      if (clockPicker) {
        // v5 mobile mode
        // should not happen, see `desktopModeMediaQuery`
        if (window?.matchMedia?.("(pointer:none)")?.matches) {
          throw new Error("Pointer media feature is neither coarse nor fine");
        }
        this.skip();
      } else if (clockBtn.length) {
        // v6 desktop mode
        clockBtn.last().simulate("click");
        const dclockPicker = document.querySelector<HTMLElement>(".MuiMultiSectionDigitalClock-root");
        expect(dclockPicker, "dclockPicker").to.exist;

        const hourBtn = document.querySelector<HTMLElement>(
          ".MuiMultiSectionDigitalClock-root" 
          + " > .MuiMultiSectionDigitalClock-root:nth-child(1)" 
          + " > .MuiMenuItem-root:nth-child(11)" 
        );
        expect(hourBtn, "hourBtn").to.exist;
        expect(hourBtn?.innerText, "hourBtn").to.eq("10");
        hourBtn?.click();

        const minBtn = document.querySelector<HTMLElement>(
          ".MuiMultiSectionDigitalClock-root" 
          + " > .MuiMultiSectionDigitalClock-root:nth-child(2)" 
          + " > .MuiMenuItem-root:nth-child(7)" 
        );
        expect(minBtn, "minBtn").to.exist;
        expect(minBtn?.innerText, "minBtn").to.eq("30");
        minBtn?.click();

        const okBtn = document.querySelector<HTMLElement>(
          ".MuiPickersLayout-root"
          + " .MuiDialogActions-root" 
          + " .MuiButton-root" 
        );
        expect(okBtn, "okBtn").to.exist;
        okBtn?.click();

        const timeInputValue = timeInput.getDOMNode().getAttribute("value");
        expect(timeInputValue, "timeInputValue").to.eq("10:30");

        // for v6 onChange is fired 2 times: on hour change and on time change
        changeIndex = 1;
      } else {
        // v5 desktop mode
        qb
          .find(".rule--widget--TIME .MuiInput-input")
          .at(1)
          .simulate("change", { target: { value: "10:30" } });
      }
      
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "time" }, 60*60*10+60*30 ] }] }
      ], changeIndex);
    }, {
      ignoreLog: ignoreLogDatePicker,
    });
  });

});
