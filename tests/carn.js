Env = require('../lib/env.js')
ENV = new Env(10,10)

ENV.addCell(0,0,undefined,10,100,10)
ENV.addCell(1,1,undefined,10,20,10)

setInterval(_=>{
  console.log('\033c')
  console.log(ENV+'')
  ENV.cell.map(a=> console.log(a+''))
  ENV.step()
},500)
