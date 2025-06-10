import { FetchFn, NumberFn } from "./scripts/lib.js";
import { DomFn } from "./scripts/client.js";
import { Cell } from "./Game.js"

// UTILS
const domFn = new DomFn();
const fetchFn= new FetchFn()
const numFn= new NumberFn()

// APP
const select= domFn.select("aside > select")
const button= domFn.select("aside > button")
const canvas= domFn.select("canvas")
const ctxt= canvas.getContext("2d")
ctxt.size= 100

const width= canvas.width
const height= canvas.height
const schemas= await fetchFn.get(null, "json", location.href + "assets/GameSchemas.json")
const {
  clignotant, 
  croix, 
  galaxie, 
  planeur, 
  LWSS
} = schemas
const all= [...clignotant, ...croix, ...galaxie, ...planeur, ...LWSS]
let state
let startTime

function initState(schema= []){
  state= []

  for (let i=0; i<ctxt.size; i++){
    state.push([])
  
    for (let j=0; j<ctxt.size; j++){
      state[i][j]= new Cell(j, i)
    }
  }
  
  schema.forEach(c=>{
    state[c[1]][c[0]].live= true
  })
}
function drawGrid(){
  ctxt.strokeStyle= "white"

  for (let i=0, j=-ctxt.size; j<ctxt.size; i++, j++){
    if (j>=0) {
      const col= width/ctxt.size

      ctxt.beginPath()
      ctxt.moveTo(j*col, 0)
      ctxt.lineTo(j*col, height)
      ctxt.stroke()
      ctxt.closePath()
    } else {
      const row= height/ctxt.size

      ctxt.beginPath()
      ctxt.moveTo(0, i*row)
      ctxt.lineTo(width, i*row)
      ctxt.stroke()
      ctxt.closePath()
    }
  }
}
function nextState(){
  const next= [] 

  for (let i=0; i<state.length; i++){
    next.push([])

    for (let j=0; j<state.length; j++){
      next[i][j]= new Cell(j,i)
      next[i][j].live= state[i][j].live

      const topLeft= state[i-1] ? state[i-1][j-1] : null
      const top= state[i][j-1]
      const topRight= state[i+1] ? state[i+1][j-1] : null
      const left= state[i-1] ? state[i-1][j] : null
      const right= state[i+1] ? state[i+1][j] : null
      const bottomLeft= state[i-1] ? state[i-1][j+1] : null
      const bottom= state[i][j+1]
      const bottomRight= state[i+1] ? state[i+1][j+1] : null
      const neighbors= [
	topLeft,
	top,
	topRight,
	left,
	right,
	bottomLeft,
	bottom,
	bottomRight
      ]
      const nextState= neighbors.filter(c=>c && c.live)

      switch (nextState.length) {
	case 3:
	  next[i][j].live= true
	  break
	case 2:
	  break
	default: 
	  next[i][j].live= false
	  break
      }
    }
  }

  state= next
}
function clearCanvas(){
  const clearSize= Math.max(width, height)
  ctxt.clearRect(-10, -10, clearSize+20, clearSize+20)
}
function loop(time){
  if (!startTime){
    startTime= time
    return requestAnimationFrame(loop)
  }
  if (time < startTime + 160){
    return requestAnimationFrame(loop)
  }
  startTime= time

  clearCanvas()
  // drawGrid()
  for (let i=0; i<state.length; i++){
    for (let j=0; j<state.length; j++){
      if (state[i][j].live) state[i][j].draw(ctxt)
    }
  }
  nextState()

  return requestAnimationFrame(loop)
}

function changeState(e){
  const target= e.target
  const newS= parseInt(target.value)
  let schema

  switch (newS) {
    case 1:
      schema= clignotant.concat(planeur)
      break
    case 2:
      schema= croix.concat(LWSS)
      break
   case 3:
      schema= all
      break
    default:
      schema= schemas[target.value]
      break
  }

  initState(schema)
}
function randState(){
  select.children[0].removeAttribute("selected")
  const newS= []

  for (let i=0; i<state.length; i++){
    newS.push([])

    for (let j=0; j<state.length; j++){
      const rand= numFn.rand(100)
      
      newS[i][j]= new Cell(j,i)
      newS[i][j].live= rand < 10
    }
  }

  state= newS
  select.children[0].setAttribute("selected", true)
}

initState(galaxie)
loop()
select.addEventListener("change", changeState)
button.addEventListener("click", randState)

