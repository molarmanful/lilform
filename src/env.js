// LILFORM - by Benjamin Pang, aka @molarmanful
// (c) MIT 2018

// helpers
let rand = (x,y)=>{
  let X = Math.min(x,y)
  let Y = Math.max(x,y)
  return (0|Math.random()*(Y-X+1))+X
}
let dist = (x,y,a,b)=> ((x-a)**2+(y-b)**2)**.5
let sort = (x,y)=> x.sort((a,b)=> y(a)-y(b))

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
    ;[...this.cell,...this.food].map(a=>{
      x[this.cols*a.row+a.col] = x[this.cols*a.row+a.col] || (a.constructor == Cell ? a.type+'' : '.')
    })
    return x.map((a,b)=>
      (a || ' ')+((b+1)%this.cols ? ' ' : '\n')
    ).join``
  }

  // initialization of objects in env
  addFood(row,col,val,regen){
    this.food.push(new Food(this,row,col,val,regen))
    return this
  }
  addCell(row,col,type,cost,energy,sight){
    this.cell.push(new Cell(this,row,col,type,cost,energy,sight))
    return this
  }

  // env cleaning functions
  cull(){
    this.food = this.food.filter(a=> a.val > 0)
    this.cell = this.cell.filter(a=> a.energy > 0)
  }

  // running sim
  step(){
    // cell actions
    this.cell.map((a,b)=>{
      this.cell[b].decide(this.food,this.cell)
    })
    // food regen
    this.food.map((a,b)=>{
      this.food[b].add(1)
    })
    // clean up map
    this.cull()
    return this
  }
}

class Food {
  constructor(
    env,
    row = rand(0,env.rows-1),
    col = rand(0,env.cols-1),
    val = rand(1,100),
    regen = rand(1,val)
  ){
    this.env = env
    this.row = row
    this.col = col
    this.val = val
    this.base = val
    this.regen = regen
  }

  // for printing/debugging purposes
  toString(){
    return `F[${this.row},${this.col}]${this.val}`
  }

  // modify food value
  sub(x){
    this.val -= x
    return this
  }
  add(x = this.regen){
    if(this.val < this.base) this.val += x
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
    sight = rand(1,10)
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
  }

  // for printing/debugging purposes
  toString(){
    return `C${this.type}[${this.row} ${this.col}]{${this.cost} ${this.sight}}${this.energy}/${this.base}`
  }

  // acting function
  decide(food,cell){
    if(this.energy <= 0) return this

    // get all food unoccupied by a cell
    let aroundf = food.filter(a=> this.env.cell.filter(b=> a.row == b.row && a.col == b.col).length < 2)
    // get "killable" cell that is not own type
    let aroundc = cell.filter(a=> this.type != a.type)

    let around = [...aroundf,...aroundc]
    // default case handling
    if(!around.length) around = food
    // find nearest food/cell
    let nearing = sort(this.findFood(around), a=> dist(this.row,this.col,a.row,a.col))
    let near = nearing[0]

    // eat
    if(near && this.row == near.row && this.col == near.col){
      this.eat(near)
    }
    else if(this.energy >= this.cost){
      // move towards nearest detected food
      if(near){
        let row = Math.sign(near.row - this.row)
        let col = Math.sign(near.col - this.col)
        this.move(row,col)
      // move randomly if no food is nearby
      } else this.rmove()
    // if the cell doesn't have enough energy to move, then slowly die
    } else this.move(0,0)

    // duplicate
    if(this.energy >= 2*this.base) this.dup()
    // reproduce
    if(near && near.constructor == Cell && this.energy < near.energy) this.rep(near)
    // find food

    return this
  }

  // essential functions
  move(r,c){
    this.row += r
    this.col += c
    // idleness reduces energy by 1
    this.energy -= r||c ? this.cost : 1

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
    let y = x.val || x.energy
    let X = y < this.cost ? y : this.cost
    this.energy += X
    // reduce food value depending on food type
    if(x.constructor == Food){
      let eating = this.env.food.findIndex(a=> a.row == x.row && a.col == x.col && a.val == x.val)
      this.env.food[eating].sub(X)
    } else {
      let eating = this.env.cell.findIndex(a=> a.row == x.row && a.col == x.col && a.energy == x.energy)
      this.env.cell[eating].drain(X)
    }

    return this
  }
  drain(x){
    this.energy -= x

    return this
  }
  dup(){
    this.env.addCell(this.row,this.col,this.type,this.cost,this.base,this.sight)
    this.drain(this.base)

    return this
  }
  rep(x){
    this.env.addCell(this.row,this.col,this.type,rand(this.cost,x.cost),rand(this.base,x.base),rand(this.sight,x.sight))
    this.drain(1)
    let other = this.env.cell.findIndex(a=> a.row == x.row && a.col == x.col && a.energy == x.energy)
    this.env.cell[other].drain(this.energy)

    return this
  }

  // check if food is within sight
  findFood(food){
    return food.filter(a=> (a.val > 0 || a.energy > 0) && dist(a.row,a.col,this.row,this.col) <= this.sight)
  }
}

if(typeof module !== 'undefined' && module.exports) module.exports = Env
