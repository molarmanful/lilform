Env = require('../lib/env.js')
ENV = new Env(10,10)

ENV.addCell(0,0,undefined,1,2,10)
ENV.addFood(1,1,100)

setInterval(_=>{
  console.log('\033c')
  console.log(ENV+'')
  ENV.cell.map(a=> console.log(a+''))
  ENV.step()
},500)
