/***
 * @fileoverview Error module.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Custom Errors.
 * @license MIT
 */

class AjvSimplifiedError extends Error {
  constructor(ajvErrors, schemaPath = null) {
    console.log(ajvErrors)
    const errorMsgs = ajvErrors.reduce((acc, curr, i) => {
      const property = path.basename(curr.dataPath)
      const { additionalProperty } = curr.params
      acc.push(
        chalk.red(`  error (${
          curr.keyword}): The property '${
          property ? property : additionalProperty + ' is extraneous and must be removed.'} ${
          property ? curr.message : ''}`)
      )
      return acc
    }, [])
    const header = chalk.yellow(`JSON was not vaild according to its schema!${
      schemaPath ? ('\n  Schema file: ' + schemaPath) : ''
    }\n`)
    super( header + errorMsgs.join('\n') )
    this.name = chalk.red(this.constructor.name)
  }
}

module.exports = {
  AjvSimplifiedError
}