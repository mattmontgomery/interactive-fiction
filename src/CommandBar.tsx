import React, { FormEvent } from "react";
import { connect } from "react-redux";
export const SUBMIT_EVENT = "CommandBar/submit";

export function CommandBar(props) {
  return (
    <form
      onSubmit={(ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
        props.submit(
          ((ev.target as HTMLFormElement)!.elements[0] as HTMLInputElement)!
            .value
        );
      }}
    >
      <input placeholder="? " />
    </form>
  );
}

export default connect(
  (state) => ({}),
  (dispatch) => ({
    submit: (input) =>
      dispatch({
        type: SUBMIT_EVENT,
        data: input,
      }),
  })
)(CommandBar);
