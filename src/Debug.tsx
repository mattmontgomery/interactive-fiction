import React from "react";
import { useSelector } from "react-redux";
import { GameState } from "./interfaces";

export default function Debug() {
  const { log, env } = useSelector((state: GameState) => ({
    log: [...state.log].reverse().slice(0, 10),
    env: state.env,
  }));
  const state = useSelector((state) =>
    Object.keys(state)
      .filter((i) => !~["log", "gameState"].indexOf(i))
      .reduce((acc, curr) => ({ ...acc, [curr]: state[curr] }), {})
  );
  return (
    <div style={{ display: "grid" }}>
      {!!~["DEMO", "DEVELOPMENT"].indexOf(env) && (
        <div>
          {log.map((log, key) => (
            <pre key={key}>{JSON.stringify(log)}</pre>
          ))}
        </div>
      )}

      {!!~["DEVELOPMENT"].indexOf(env) && (
        <pre>{JSON.stringify(state, null, 2)}</pre>
      )}
    </div>
  );
}
