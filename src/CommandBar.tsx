import React, { FormEvent, useRef, useState, KeyboardEvent } from "react";
import { useDispatch } from "react-redux";
export const SUBMIT_EVENT = "CommandBar/submit";

export function CommandBar(props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const dispatch = useDispatch();
  return (
    <form
      onKeyUp={(ev: KeyboardEvent) => {
        if (ev.key === "ArrowUp" && inputRef && inputRef.current) {
          ev.stopPropagation();
          const updatedHistory: string[] = [...history];
          inputRef.current.value = updatedHistory.pop() || "";
          setHistory(updatedHistory);
        }
      }}
      onSubmit={(ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
        const value = ((ev.target as HTMLFormElement)!
          .elements[0] as HTMLInputElement)!.value;
        dispatch({ type: SUBMIT_EVENT, data: value });
        setHistory([...history, value]);
        ((ev.target as HTMLFormElement)!
          .elements[0] as HTMLInputElement).value = "";
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <span style={{ gridColumn: 1 }}>? </span>
      <input
        ref={inputRef}
        style={{
          color: "white",
          fontSize: "1.25rem",
          fontFamily: "inherit",
          fontWeight: "bold",
          border: 0,
          gridColumn: 2,
          padding: ".5rem",
          backgroundColor: "inherit",
          outline: "none",
          borderBottom: "1px solid #777",
        }}
      />
    </form>
  );
}

export default CommandBar;
