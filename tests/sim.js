let Env = require('../lib/env.js')
let ENV = new Env(50,50)
let C = 10

;[...new Array(C)].map(_=> ENV.addCell())
;[...new Array(7000)].map(_=> ENV.addFood())

let info = [...new Array(C)].map((_,a)=>[
  ENV.cell[a].base,
  ENV.cell[a].cost,
  ENV.cell[a].sight,
  ENV.cell[a].lim
])

let N = 0
setInterval(_=>{
  console.log('\033c')
  console.log(ENV+'')
  console.log(++N)
  ;[...new Array(C)].map((_,a)=>{
    console.log(
      a+'\t'+
      (x = ENV.cell.filter(b=> b.type == a).length)+'\t'+
      info[a].join`\t`
    )
  })
  ENV.step()
},100)
