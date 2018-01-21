const d = require('./')

const i = new d({
  port: 53,
  host: '0.0.0.0',
  ttl: 3600
})
i.start(console.log)
