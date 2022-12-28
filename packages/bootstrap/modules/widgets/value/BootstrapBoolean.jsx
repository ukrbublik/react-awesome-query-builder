import React from "react";
import { Utils } from "@react-awesome-query-builder/ui";
import { Button, ButtonGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
const { uuid } = Utils;

export default (props) => {
  const { value, setValue, config, labelYes, labelNo, readonly } = props;
  const onRadioChange = (e) => setValue(e.target.value == "true");
  const id = uuid(), id2 = uuid();
  
  return (
    <>
      <ButtonGroup>
        <Button
          id={id}
          value={true}
          checked={!!value}
          disabled={readonly}
          color={value === true ? "success" : "secondary"}
          onClick={onRadioChange}
          size={"sm"}
        >
          <FontAwesomeIcon icon={faCheck} />
        </Button>
        <Button
          id={id2}
          value={false}
          checked={!value}
          disabled={readonly}
          color={value === false ? "danger" : "secondary"}
          onClick={onRadioChange}
          size={"sm"}
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </ButtonGroup>
    </>
  );
};
