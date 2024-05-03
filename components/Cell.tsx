// import * as React from "react"
import React, { useState } from "react";

// LOGIC ===========================================================================================
export enum Status {
  Open, Closed, Done, Failed
}

export type Cell = {
  symbol : string
  status : Status
}

export type PredFn = (cell : Cell) => boolean

export let isOpen = (cell : Cell) : boolean => (
  cell.status == Status.Open
)

export let isClosed = (cell : Cell) : boolean => (
  cell.status == Status.Closed
)

export let isDone = (cell : Cell) : boolean => (
  cell.status == Status.Done
)

export let isFailed = (cell : Cell) : boolean  => (
  cell.status == Status.Failed
)

export let isBlocking = (cell : Cell) : boolean => (
  isOpen(cell) || isFailed(cell)
)

// VIEW ============================================================================================
type CellViewProps = {
  cell : Cell,
  onClick : (event : React.MouseEvent) => void,
}

export let CellView: React.FC<CellViewProps> = ({ cell, onClick }) => {
  let { status, symbol } = cell;
  const [flipped, setFlipped] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (status === Status.Closed) {
      onClick(event);
      setFlipped((prevFlipped) => !prevFlipped);
    }
  };

  return (
    <div
      className={`cell ${status === Status.Open ? "open" : ""} ${
        flipped ? "flip" : ""
      }`}
      onClick={handleClick}
      style={{ background: statusToBackground(status) }}
    >
      <div className="inner-content">
        {status === Status.Closed ? "" : (
          <div className={`symbol ${flipped ? "flip" : ""}`}>{symbol}</div>
        )}
      </div>
    </div>
  );
};

export let statusToBackground = (status : Status) : string => {
  switch (status) {
    case Status.Closed: return "darkgray"
    case Status.Open:   return "#dcdcdc"
    case Status.Done:   return "#a8db8f"
    case Status.Failed: return "#db8f8f"
  }
}