const Joi = require('joi')

const type = /^(PEM|DER)$/
const b58 = /^Qm.+$/ // TODO: better regex
const ma = /^\/.+$/ // TODO: better regex

// TODO: better validation

module.exports = Joi.object().keys({
  certificate: Joi.object().keys({
    type: Joi.string().regex(type).required(),
    location: Joi.string().required()
  }).required(),
  privateKey: Joi.object().keys({
    type: Joi.string().regex(type).required(),
    location: Joi.string().required()
  }).required(),
  dns: Joi.object().keys({
    replace: Joi.object(),
    pattern: Joi.object().keys({
      ip4: Joi.string().required(),
      ip6: Joi.string().required()
    })
  }).required(),
  discovery: Joi.alternatives(Joi.object().keys({
    id: Joi.string().regex(b58).required(),
    addr: Joi.array().items(Joi.string().regex(ma).required()).required()
  }).required(), Joi.boolean().falsy('N').required()).required()
})
