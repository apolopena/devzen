/***
 * @fileoverview Organized colors by meaningful name and string hex value.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Provides palettes of colors in complimentary sets. The name of a
 * palette's color is the true name of the color it's string hex value represents.
 * @license MIT
 */

/* 
  NOTE: please respect the alphabetical order when adding new color names anywhere.
  Whenever adding a new color constant add it to the root of module exposrts and
  to the all object. If adding a color to a pallete or creating a new palette be sure
  to add that color to all three places. Avoid adding to existing palette and try to
  add all your colors at once when create new palettes.
*/

const cornflower = '#AFD7FF'
const mint = '#AFFFD7'
const pink = '#FFAFD7'
const peach = '#FFD7AF'
const rose = '#FFAFFF'
const salmon = '#FFAFAF'
const shalimar = '#FFFFAF'
const coral = '#FF7F58'

module.exports = {
  palettes: {
    pastelOne: {
      cornflower,
      mint,
      pink,
      peach,
      rose,
      salmon,
      shalimar,
      coral /* good for error/warn/strong mesages */
    }
  },
  all: {
    cornflower,
    mint,
    pink,
    peach,
    rose,
    salmon,
    shalimar,
    coral
  }
}