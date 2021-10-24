import moment from "moment";
import { expect } from "chai";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_material, hexToRgbString } from "../support/utils";

describe("material-ui theming", () => {
  it("applies secondary color", () => {
    with_qb_material(configs.with_theme_material, inits.with_bool, "JsonLogic", (qb) => {
      const boolSwitch = qb.find(".rule--value .MuiSwitch-thumb");
      expect(boolSwitch, "boolSwitch").to.have.length(1);
      const boolSwitchNode = boolSwitch.at(0).getDOMNode() ;
      const boolSwitchStyle = getComputedStyle(boolSwitchNode);
      expect(boolSwitchStyle.getPropertyValue("color"), "boolSwitch color").to.eq(hexToRgbString("#edf2ff"));
    }, {
      attach: true
    });
  });
});

describe("material-ui widgets interactions", () => {

  it("change date", () => {
    with_qb_material(configs.with_date_and_time, inits.with_date_and_time, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      // open date picker for '2020-05-18'
      const openPickerBtn = qb.find(".rule--widget--DATE button.MuiIconButton-root");
      expect(openPickerBtn, "openPickerBtn").to.have.length(1);
      openPickerBtn.simulate("click");

      // click on 3rd week, 2nd day of week (should be sunday, 10 day for default US locale)
      const dayBtn = document.querySelector<HTMLElement>(
        ".MuiDialog-root" 
        + " .MuiPickersCalendar-week:nth-child(3)" 
        + " > div:nth-child(2)" 
        + " .MuiPickersDay-day"
      );
      expect(dayBtn, "dayBtn").to.exist;
      expect(dayBtn?.innerText, "dayBtn").to.eq("11");
      dayBtn?.click();

      // click ok
      const okBtn = document.querySelector<HTMLElement>(
        ".MuiDialog-root" 
        + " .MuiDialogActions-root" 
        + " .MuiButton-root:nth-child(2)"
      );
      expect(okBtn, "okBtn").to.exist;
      okBtn?.click();

      // now input should be '2020-05-11'
      const dateInput = qb.find(".rule--widget--DATE input.MuiInput-input");
      expect(dateInput, "dateInput").to.have.length(1);
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

  it("change time value", () => {
    with_qb_material(configs.with_all_types, inits.with_time, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const {onChange: onChangeDate} = qb
        .find("KeyboardDateInput")
        .props();
      // @ts-ignore  
      onChangeDate(moment("0001-01-01 10:30"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "time" }, 60*60*10+60*30 ] }] }
      ]);
    });
  });


});
