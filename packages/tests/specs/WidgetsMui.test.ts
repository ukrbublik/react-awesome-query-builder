import moment from "moment";
import { expect } from "chai";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_mui, hexToRgbString } from "../support/utils";

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
        dateInput.simulate("click");
      }

      // click on 3rd week, 2nd day of week (should be sunday, 10 day for default US locale)
      const dayBtn = document.querySelector<HTMLElement>(
        ".MuiCalendarPicker-root" 
        + " .MuiDayPicker-monthContainer"
        + " .MuiDayPicker-weekContainer:nth-child(3)" 
        + " > .MuiPickersDay-root:nth-child(2)" 
      );
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
    });
  });

  it("change time value", async function() {
    await with_qb_mui(configs.with_all_types, inits.with_time, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const timeInput = qb.find(".rule--widget--TIME input.MuiInput-input");
      expect(timeInput, "timeInput").to.have.length(1);
      timeInput.simulate("click");
      const clockPicker = document.querySelector<HTMLElement>(".MuiClockPicker-root");
      if (clockPicker) {
        // mobile mode
        this.skip();
      } else {
        // desktop mode
        qb
        .find(".rule--widget--TIME .MuiInput-input")
        .at(1)
        .simulate("change", { target: { value: "10:30" } });
      }
      
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "time" }, 60*60*10+60*30 ] }] }
      ]);
    });
  });


});
