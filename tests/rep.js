Env = require('../env.js')
ENV = new Env(10,10)

ENV.addCell(1,1,undefined,1,10,10)
ENV.addCell(1,1,undefined,27,26,10)

setInterval(_=>{
  console.log('\033c')
  console.log(ENV+'')
  ENV.cell.map(a=> console.log(a+''))
  ENV.step()
},2000)
