/***
 * @fileoverview Colorizes console.log.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Provides console.log in paletts of pretty colors.
 * @requires custom-hex-colors.js
 * @requires local-console-logger.js
 * @license MIT
 */

const pastelOne = require('./custom-hex-colors').palettes.pastelOne
const c = require('../../../../local-console-logger.js').colorizeConsoleLog

const trueColor = {
  pastelOne: {
    rose: c(pastelOne.rose),
    shalimar: c(pastelOne.shalimar),
    cornflower: c(pastelOne.cornflower),
    mint: c(pastelOne.mint),
    pink: c(pastelOne.pink),
    peach: c(pastelOne.peach),
    salmon: c(pastelOne.salmon)
  }
}
module.exports = {
  trueColor
}