import React from "react";
import "./App.css";
import CommandBar from "./CommandBar";
import Debug from "./Debug";
import GameState from "./GameState";

function App() {
  return (
    <div style={{ minHeight: "100vh", padding: "1rem" }}>
      <header style={{ minHeight: "10vh" }}>It's a game</header>
      <section
        style={{ maxHeight: "80vh", display: "flex", overflow: "hidden" }}
      >
        <div
          style={{
            minWidth: "50vh",
            flex: 1,
            overflow: "scroll",
            padding: "1rem",
            borderRight: "4px solid #ddd",
          }}
        >
          <GameState />
        </div>
        <div style={{ minWidth: "20vh", overflow: "scroll", padding: "1rem" }}>
          <Debug />
        </div>
      </section>
      <footer style={{ minHeight: "10vh" }}>
        <CommandBar />
      </footer>
    </div>
  );
}

export default App;
