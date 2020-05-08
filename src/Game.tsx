import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import useScrollToBottom from "./hooks/useScrollToBottom";
import { GameState } from "./interfaces";

export default function Game() {
  const listEl = useRef<HTMLDivElement>(null);
  const gameState = useSelector((state: GameState) => state.gameState);
  useEffect(useScrollToBottom(listEl), [gameState]);
  return (
    <div ref={listEl}>
      {gameState.map((state, idx) => (
        <p key={idx}>{state}</p>
      ))}
    </div>
  );
}
