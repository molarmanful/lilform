// LILFORM - by Benjamin Pang, aka @molarmanful
// (c) MIT 2018

// libs
let async = require('async')

// helpers
let rand = (x,y)=>{
  let X = Math.min(x,y)
  let Y = Math.max(x,y)
  return (0|Math.random()*(Y-X+1))+X
}
let dist = (x,y,a,b)=> ((x-a)**2+(y-b)**2)**.5
let sort = (x,y)=> x.sort((a,b)=> y(a)-y(b))
let sort2 = (x,y,z)=> x.sort((a,b)=> y(a)-y(b) || z(a)-z(b))
let em = '\u263a\u263b\u2665\u2666\u2663\u2660\u2642\u2640\u266a\u263c'

class Env {
  constructor(rows,cols){
    this.rows = rows
    this.cols = cols
    this.food = []
    this.cell = []
    this.type = 0
  }

  // for printing/debugging purposes
  toString(){
    let x = [...new Array(this.rows*this.cols)]
    this.cell.map(a=>{
      x[this.cols*a.row+a.col] = em[a.type]
    })
    return x.map((a,b)=>
      (a || ' ')+((b+1)%this.cols ? ' ' : '\n')
    ).join``
  }

  // initialization of objects in env
  addFood(row,col,energy,regen){
    this.food.push(new Food(this,row,col,energy,regen))
    return this
  }
  addCell(row,col,type,cost,energy,sight,lim){
    this.cell.push(new Cell(this,row,col,type,cost,energy,sight,lim))
    return this
  }

  // env cleaning functions
  cull(){
    async.parallel([
      _=> this.food = this.food.filter(a=> a.energy > 0),
      _=> this.cell = this.cell.filter(a=> a.energy > 0)
    ])
    return this
  }

  // running sim
  step(){
    // cell actions
    async.eachOf(this.cell,(a,b)=>{
      if(this.cell[b]) this.cell[b].decide(this.food,this.cell)
    })
    // food regen
    async.eachOf(this.food,(a,b)=>{
      if(this.food[b]) this.food[b].add(1)
    })
    this.cull()

    return this
  }
}

class Food {
  constructor(
    env,
    row = rand(0,env.rows-1),
    col = rand(0,env.cols-1),
    energy = rand(1,100),
    regen = rand(1,energy)
  ){
    this.env = env
    this.row = row
    this.col = col
    this.energy = energy
    this.base = energy
    this.regen = regen
  }

  // for printing/debugging purposes
  toString(){
    return `F[${this.row},${this.col}]${this.energy}`
  }

  // modify food energy
  drain(x){
    this.energy -= x

    return this
  }
  add(x = this.regen){
    if(this.energy < this.base) this.energy += x
    if(this.energy > this.base) this.energy = this.base

    return this
  }
}

class Cell {
  constructor(
    env,
    row = rand(0,env.rows-1),
    col = rand(0,env.cols-1),
    type = env.type++,
    cost = rand(1,10),
    energy = rand(cost*2,cost*10),
    sight = rand(1,10),
    lim = rand(cost*10,cost*20)
  ){
    this.env = env
    this.row = row
    this.col = col
    this.type = type

    // energy management
    this.cost = cost
    this.energy = energy
    this.base = energy

    // senses for finding food, reacting to env, etc.
    this.sight = sight

    // cell duplication limit
    this.lim = lim
  }

  // for printing/debugging purposes
  toString(){
    return `C${this.type}[${this.row} ${this.col}]{${this.cost} ${this.sight} ${this.lim}}${this.energy}/${this.base}`
  }

  // acting function
  decide(food,cell){
    if(this.energy <= 0) return this
    // if the cell doesn't have enough energy to move, then slowly die
    if(this.energy < this.cost){
      this.move(0,0)
      return this
    }

    // get "killable" cell that is not own type
    let aroundc = this.findFood(cell)
    // get all food unoccupied by a cell
    let aroundf = this.findFood(food).filter(a=> aroundc.filter(b=> a.row == b.row && a.col == b.col).length == 0)
    if(!aroundf.length) aroundf = this.findFood(food)
    // find nearest food/cell
    let nearing = sort2([...aroundf,...aroundc], a=> dist(this.row,this.col,a.row,a.col), a=>-a.energy)

    let near = nearing[0]

    if(near){
      // reproduce
      if(near.constructor == Cell && this.energy < near.energy) this.rep(near)
      // eat
      if(this.row == near.row && this.col == near.col) this.eat(near)
      // move towards nearest landmark
      else {
        let row = Math.sign(near.row - this.row)
        let col = Math.sign(near.col - this.col)
        this.move(row,col)
      }
    // move randomly until something appears nearby
    } else this.rmove()

    // duplicate
    if(this.energy >= 2*this.base) this.dup()

    return this
  }

  // essential functions
  move(r,c){
    this.row += r
    this.col += c
    // idleness reduces energy by 1
    this.drain(r||c ? this.cost : 1)

    return this
  }
  rmove(){
    let row = rand(-1,1)
    let col = rand(-1,1)
    // wall constraints
    if(this.row == 0) row = rand(0,1)
    if(this.row == this.env.rows-1) row = rand(-1,0)
    if(this.col == 0) col = rand(0,1)
    if(this.col == this.env.cols-1) col = rand(-1,0)
    this.move(row,col)

    return this
  }
  eat(x){
    let y = x.energy
    let X = y < this.cost ? y : this.cost
    this.energy += X
    // reduce food's energy
    if(x.constructor == Food){
      let eating = this.env.food.findIndex(a=> a.row == x.row && a.col == x.col && a.energy == x.energy)
      this.env.food[eating].drain(X)
    } else {
      let eating = this.env.cell.findIndex(a=> a.type == x.type && a.row == x.row && a.col == x.col && a.energy == x.energy)
      this.env.cell[eating].drain(X)
    }

    return this
  }
  drain(x){
    this.energy -= x

    return this
  }
  dlim(x){
    this.lim -= x
    if(this.lim <= 0) this.drain(this.energy)

    return this
  }
  dup(){
    this.env.addCell(this.row,this.col,this.type,this.cost,this.base,this.sight)
    this.drain(this.base)
    this.dlim(this.cost)

    return this
  }
  rep(x){
    this.env.addCell(this.row,this.col,this.type,rand(this.cost,x.cost),rand(this.base,x.base),rand(this.sight,x.sight))
    this.drain(this.cost)
    this.dlim(this.cost)

    return this
  }

  // check if food is within sight
  findFood(food){
    return food.filter(a=> a.energy > 0 && a.type != this.type && dist(a.row,a.col,this.row,this.col) <= this.sight)
  }
}

if(typeof module !== 'undefined' && module.exports) module.exports = Env
