import { FetchFn, NumberFn } from "./scripts/lib.js";
import { DomFn } from "./scripts/client.js";

// UTILS
const domFn = new DomFn();
const fetchFn= new FetchFn()
const numFn= new NumberFn()

// APP
const select= domFn.select("aside > select")
const button= domFn.select("aside > button")
const canvas= domFn.select("canvas")
const ctxt= canvas.getContext("2d")
const gridSize= 100
const width= canvas.width
const height= canvas.height
const cellWidth= width/gridSize
const cellHeight= height/gridSize
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

  for (let i=0; i<gridSize; i++){
    state[i]= []
  
    for (let j=0; j<gridSize; j++){
      state[i][j]= false
    }
  }

  schema.forEach(c=>{
    state[c[1]][c[0]]= true
  })
}
function getNbrs(x, y){
  const nbrs= []

  for (let i= x-1; i< x+2; i++){
    for (let j= y-1; j< y+2; j++){
      if (x===i && y===j) continue

      const k= numFn.loop(i, 0, gridSize - 1)
      const l= numFn.loop(j, 0, gridSize - 1)
      nbrs.push(state[k][l])
    }
  }

  return nbrs
}
function nextState(){
  const next= [] 

  for (let i=0; i<state.length; i++){
    next[i]= []

    for (let j=0; j<state.length; j++){
      next[i][j]= state[i][j]
      const validNbrs= getNbrs(i,j).filter(c=>c)

      switch (validNbrs.length) {
	case 3:
	  next[i][j]= true
	  break
	case 2:
	  break
	default: 
	  next[i][j]= false
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
function drawCell(x, y, color= [120, 100, 50]){
  const style= `hsl(${color[0]}, ${color[1]}%, ${color[2]}%)`

  ctxt.beginPath()
  ctxt.fillStyle= style
  ctxt.rect(x*cellWidth, y*cellHeight, cellWidth, cellHeight)
  ctxt.fill()
  ctxt.closePath()
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
  for (let i=0; i<state.length; i++){
    for (let j=0; j<state.length; j++){
      if (state[i][j]) drawCell(j, i)
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
    newS[i]= []

    for (let j=0; j<state.length; j++){
      const rand= numFn.rand(100)
      newS[i][j]= rand < 10
    }
  }

  state= newS
  select.children[0].setAttribute("selected", true)
}

initState(galaxie)
loop()
select.addEventListener("change", changeState)
button.addEventListener("click", randState)

