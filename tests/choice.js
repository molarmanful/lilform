Env = require('../lib/env.js')
ENV = new Env(10,10)

ENV.addCell(2,2,undefined,1,5,10)
ENV.addFood(2,0,1)
ENV.addFood(2,4,1)
ENV.addFood(0,2,1)
ENV.addFood(4,2,100)

setInterval(_=>{
  console.log('\033c')
  console.log(ENV+'')
  ENV.cell.map(a=> console.log(a+''))
  ENV.food.map(a=> console.log(a+''))
  ENV.step()
},500)
