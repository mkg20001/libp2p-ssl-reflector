const d = require('./')

const i = new d({
  port: 4500,
  ttl: 1
})
i.start(console.log)
