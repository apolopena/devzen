/***
 * @fileoverview Yargs option objects for videos-cli.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Modularizes options for the videos-cli command line tool.
 * Utilizes JSON Schema for options validation and data.
 * @requires path
 * @requires yargs-colorizer
 * @license MIT
 */

const path = require('path')

const {
  pastelColor,
  pastelColorStrings: c 
} = require('../yargs-colorizer');

const schema = require('./options-schema.json')

const options = Object.keys(schema.properties).reduce((acc, key) => {
  const val = schema.properties[key]
  acc[key] = val
  acc[key].description = c.mint(
    `${acc[key].description}${(val.comment) 
      ? (' ' + c.coral(acc[key].comment))
      : '' }`
  )
  acc[key].alias = key
  return acc
}, {})

module.exports = {
  data: options,
  stringColorizer: c,
  yargsColorizer: pastelColor
}
