import { NumberFn } from "./scripts/lib.js"

const numFn= new NumberFn()

export class Cell {
  constructor(x, y, live=false) {
    this.x= x
    this.y= y
  }

  draw(ctxt){
    const cellSize= [
      Math.round(ctxt.canvas.width/ctxt.size),
      Math.round(ctxt.canvas.height/ctxt.size)
    ]

    ctxt.beginPath()
    ctxt.fillStyle= this.#style(120, 100, 50)
    ctxt.fillRect(this.x*cellSize[0], this.y*cellSize[1], cellSize[0], cellSize[1])
    ctxt.closePath()
  }

  #style(h,s,l){
    return `hsl(${h}, ${s}%, ${l}%)` 
  }
}
