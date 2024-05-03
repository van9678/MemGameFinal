import * as R from "rambda"
import React, {FC, useEffect, useState} from "react"
import * as Cell from "./Cell"
import * as Board from "./Board"

// LOGIC ===========================================================================================
export enum Status {
  Stopped, Running, Won, Lost
}

export type State = {
  board : Board.Board
  secondsLeft : number
  status : Status
}

const startGame = (pairsCount: number, stolb: number): State => ({
  board: Board.makeRandom(pairsCount, stolb),
  secondsLeft: 60,
  status: Status.Running,
})

let openCell = (i : number) => (state: State) : State => (
  {...state, board: Board.setStatusAt(i)(Cell.Status.Open) (state.board)})

let canOpenCell = (i : number) => (state : State) : boolean => (
  Board.canOpenAt(i)(state.board)
)

let succeedStep = (state : State) : State => (
  {...state, board: Board.setStatusesBy(Cell.isOpen) (Cell.Status.Done)(state.board)}
)

let failStep1 = (state : State) : State => (
  {...state, board: Board.setStatusesBy(Cell.isOpen) (Cell.Status.Failed) (state.board)}
)

let failStep2 = (state : State) : State => ({
  ...state, board: Board.setStatusesBy(Cell.isFailed) (Cell.Status.Closed) (state.board),
})

let hasWinningCond = (state : State) : boolean => (
  R.filter(Cell.isDone, state.board).length == state.board.length
)

let hasLosingCond = (state : State) : boolean => (
  !state.secondsLeft
)

let setStatus = (status : Status) => (state : State) :State => (
  {...state, status}
)

let nextSecond = (state : State) : State => ({
  ...state, secondsLeft: Math.max(state.secondsLeft - 1, 0),
})

export function View() {
  let [state, setState] = useState({
    ...startGame(4, 3), 
    status: Status.Stopped,
  })

  let {board, status, secondsLeft} = state

  let handleStartingClick = () => {
    if (status != Status.Running) {
      setState(startGame(4, 3)) 
    }
  }

  let handleRunningClick = (i : number) => {
    if (status == Status.Running && canOpenCell(i) (state)) {
      setState(openCell(i))
    }
  }

  // WIN/LOSE MECHANICS
  useEffect(() => {
    if (status == Status.Running) {
      if (hasWinningCond(state)) {
        return setState(setStatus(Status.Won))
      }
      else if (hasLosingCond(state)) {
        return setState(setStatus(Status.Lost))
      }
    }
  }, [state])

  useEffect(()=> {
    if (status == Status.Running) {
      if (Board.areOpensEqual(board)) {
        setState(succeedStep)
      } else if (Board.areOpensDifferent(board)) {
        setState(failStep1)
        setTimeout((_: any) => {
          setState(failStep2)
        }, 500)
      }
    }
  }, [board])

  // TIMER
  useEffect(() => {
    let timer : ReturnType<typeof setInterval> | undefined = undefined
    if (status == Status.Running && !timer) {
      timer = setInterval(() => {
        setState(nextSecond)
      }, 1000)
    }
    return () => {
      timer ? clearInterval(timer) : null
    }
  }, [status])

  return (
    <div>
      <StatusLineView status={status} secondsLeft={secondsLeft}/>
      <ScreenBoxView 
        status={status}
        board={board}
        onClickAt={handleRunningClick}
        onStartClick={(pairsCount, stolb) => { 
          if (status !== Status.Running) {
            setState(startGame(pairsCount, stolb));
          }
        }}
      />
    </div>
  );
}


type StatusLineViewProps = {
  status : Status
  secondsLeft : number
}

let StatusLineView : FC<StatusLineViewProps> = ({status, secondsLeft}) => {
  return <div className="status-line">
    <div className="timer">
      {status == Status.Running && `Seconds left: ${secondsLeft}`}
    </div>
  </div>
}

type ScreenBoxViewProps = {
  status: Status
  board: Board.Board
  onClickAt: (i: number) => void
  onStartClick: (pairsCount: number, stolb: number) => void 
}

let ScreenBoxView: FC<ScreenBoxViewProps> = ({ status, board, onClickAt, onStartClick }) => {
  const handleStartButtonClick = (pairsCount: number, stolb: number) => { 
    onStartClick(pairsCount, stolb);
  };

  switch (status) {
    case Status.Running:
      return <Board.BoardView board={board} onClickAt={onClickAt} />

    case Status.Stopped:
      return <Board.ScreenView background={statusToBackground(status)}>
        <div style={{ textAlign: "center" }}>
          <h1 className="Title">Игра память</h1>
          <h2 className="subTitle">Выберете уровень сложности:</h2>
          <button className="button" onClick={() => handleStartButtonClick(4,3)}>НАЧАТЬ</button>
          <button className="button middle" onClick={() => handleStartButtonClick(4,4)}>Средний</button>
          <button className="button hard" onClick={() => handleStartButtonClick(4,5)}>Сложный</button>
        </div>
      </Board.ScreenView>

    case Status.Won:
      return <Board.ScreenView background={statusToBackground(status)}>
        <div style={{ textAlign: "center" }}>
          <h1 className="Title">Поздравляю вы победили!)</h1>
          <h2 className="subTitle">Выберете уровень сложности:</h2>
          <button className="button" onClick={() => onStartClick(4,3)}>Начать Заново</button>
          <button className="button middle" onClick={() => handleStartButtonClick(4,4)}>Средний</button>
          <button className="button hard" onClick={() => handleStartButtonClick(4,5)}>Сложный</button>
        </div>
      </Board.ScreenView>

    case Status.Lost:
      return <Board.ScreenView background={statusToBackground(status)}>
        <div style={{ textAlign: "center" }}>
          <h1 className="Title">К сожалению вы проиграли(</h1>
          <h2 className="subTitle">Выберете уровень сложности:</h2>
          <button className="button" onClick={() => onStartClick(4,3)}>Начать Заново</button>
          <button className="button middle" onClick={() => handleStartButtonClick(4,4)}>Средний</button>
          <button className="button hard" onClick={() => handleStartButtonClick(4,5)}>Сложный</button>
        </div>
      </Board.ScreenView>
  }
}


let statusToBackground = (status : Status) : string => {
  switch(status) {
    case Status.Won: return "a8db8f"
    case Status.Lost: return "db8f8f"
    case Status.Stopped: return "dcdcdc"
    case Status.Running: return "dcdcdc"
    default: 
      return "dcdcdc"
  }
}