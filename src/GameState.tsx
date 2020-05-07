import React from "react";
import { connect } from "react-redux";

export function GameState(props) {
  return (
    <div>
      {props.state.gameState.map((state, idx) => (
        <div key={idx}>{state}</div>
      ))}
    </div>
  );
}

export default connect((state) => ({ state: state }))(GameState);
