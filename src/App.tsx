import React, { useEffect } from "react";
import useSound from "use-sound";
import "./App.css";
import CommandBar from "./CommandBar";
import Debug from "./Debug";
import Game from "./Game";
import { connect, useSelector } from "react-redux";
import { GameState } from "./interfaces";

export function App() {
  const { ended } = useSelector((state: GameState) => ({
    ended: state.ended,
  }));
  const [play] = useSound("/chrono-trigger.mp3", { volume: 0.5 });
  useEffect(() => {
    if (ended === true) {
      play();
    }
  }, [ended, play]);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "4fr 1fr",
        gridTemplateRows: "auto 5fr auto",
        gridGap: "15px 0",
        height: "100vh",
      }}
    >
      <header
        style={{
          gridRow: 1,
          gridColumn: "1 / span 2",
          padding: "1rem",
          fontWeight: "bold",
          fontSize: "1.25rem",
        }}
      >
        It's a game
      </header>
      <section
        style={{
          gridColumn: 1,
          gridRow: 2,
          overflow: "scroll",
          padding: "1rem",
        }}
      >
        <Game />
      </section>
      <section
        style={{
          gridColumn: 2,
          gridRow: 2,
          overflow: "scroll",
          backgroundColor: "#303030",
          margin: "1rem",
        }}
      >
        <Debug />
      </section>
      <footer style={{ gridRow: 3, gridColumn: "1 / span 2" }}>
        <CommandBar />
      </footer>
    </div>
  );
}

export default connect((state: { ended: Boolean }) => ({
  env: process.env.NODE_ENV,
  ended: state.ended,
}))(App);
