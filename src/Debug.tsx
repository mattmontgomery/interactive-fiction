import React from "react";
import { connect } from "react-redux";

export function Debug(props) {
  return <pre>{JSON.stringify(props.state, null, 2)}</pre>;
}

export default connect((state) => ({ state }))(Debug);
