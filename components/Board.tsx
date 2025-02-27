import * as R from "rambda"
import {FC} from "react"
import * as L from "../lib"
import * as Cell from "./Cell"

export type Board = Cell.Cell[]

export let getStatusAt = ((i : number) => (board : Board) : Cell.Status =>
  R.view(R.lensPath(`${i}.status`), board)
)

export let setStatusAt = ((i : number) => (status : Cell.Status) => (board : Board) : Board =>
  R.set(R.lensPath(`${i}.status`), status, board)
)

export let getStatusesBy = ((predFn : Cell.PredFn) => (board : Board) : Cell.Status[] =>
  R.chain((cell : Cell.Cell) => predFn(cell) ? [cell.status] : [], board)
)

export let setStatusesBy = ((predFn : Cell.PredFn) => (status : Cell.Status) => (board : Board) : Board =>
  R.map((cell : Cell.Cell) => predFn(cell) ? {...cell, status} : cell, board)
)

export let getSymbolsBy = ((predFn : Cell.PredFn) => (board : Board) : string[] =>
  R.chain(cell => predFn(cell) ? [cell.symbol] : [], board)
)

export let canOpenAt = ((i : number) => (board : Board) : boolean =>
  i < board.length
    && Cell.isClosed(board[i])
    && getStatusesBy(Cell.isBlocking)(board).length < 2
)

export let areOpensEqual = ((board : Board) : boolean => {
  let openSymbols = getSymbolsBy(Cell.isOpen)(board)
  return openSymbols.length >= 2 && L.allEquals(openSymbols)
})

export let areOpensDifferent = (board : Board) : boolean => {
  let openSymbols = getSymbolsBy(Cell.isOpen)(board)
  return openSymbols.length >= 2 && !L.allEquals(openSymbols)
}

let charCodeA = "A".charCodeAt(0)

export let makeRandom = (m : number, n : number) : Board => {
  if ((m * n / 2) > 26) throw new Error("too big")
  if ((m * n) % 2) throw new Error("must be even")
  return R.pipe(
    () => R.range(0, m * n / 2), // [0, 1, 2, ...]
    R.map((i : number) => String.fromCharCode(i + charCodeA)), // ["A", "B", "C", ...]
    R.chain(x => [x, x]), // ["A", "A", "B", "B", ...]
    L.shuffle,            // ["A", "C", "B", "D", ...]
    R.map((symbol : string) => ({symbol, status: Cell.Status.Closed})),
  )() as Board
}

// VIEW ============================================================================================
type BoardViewProps = {
  board : Board
  onClickAt : (i : number) => void
}

export let BoardView : FC<BoardViewProps> = ({board, onClickAt}) => {
  return <>
    <div className="board">
      {board.map((cell, i) =>
        <Cell.CellView key={i} cell={cell} onClick={_ => onClickAt(i)}/>
      )}
    </div>
    <style jsx>{`
      .board {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        width: 640px;
        height: 480px;
        gap: 2px;
      }
    `}</style>
  </>
}

type ScreenViewProps = {
  background: string
  children: any
}

export let ScreenView : FC<ScreenViewProps> = ({background, children}) => {
  return <div className="screen">
    {children}
  </div>
}
