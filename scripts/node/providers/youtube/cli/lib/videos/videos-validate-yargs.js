/***
 * @fileoverview Validation for videos-cli commands and options.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Module that takes a yargs program as input and validates various
 * commands and options as per the rules of use for videos-cli
 * @see videos-cli.js
 * @license MIT
 */

const COMMAND_NAMES = ['seed']
let program, _logger

module.exports = validateYargs

function fatal(msg, l = _logger, p = program) {
  p.showHelp()
  l.error(`Error: ${p.$0} ${msg}`)
  process.exit(1)
}

function validateYargs(yargsProgram, processArgv, logger) {
  program = yargsProgram
  _logger = logger

  const rawArgv = processArgv
  const commands = program.argv._
  const argv = program.argv

  commands.length == 0 && !argv.i && fatal(': Only the --interactive option can be used without a command.')
  commands.length > 0 && argv.i && fatal(': Commands cannot be given when the --interative option is set.')
  commands.length > 1 && fatal(`: Only one command can be given at a time. Found the commands ${commands.join(' ')}`) 
  if (commands.length == 0 || !commands.includes('seed')) {
    argv.f && fatal(': The --file option can only be used with the seed command.')
  }
  // -f, --file option is required with the seed command and cannot be empty
  if (commands.includes('seed')) {
    filePathIndex = rawArgv.indexOf('-f')
    filePathIndex === -1 && (filePathIndex = rawArgv.indexOf('--file'))
    filePathIndex === -1 && fatal(': seed command requires the --file option.')
    rawArgv[filePathIndex + 1] || fatal (': The --file option cannot be empty.')
    //fs.existsSync(argv.file) || fatal(`: the file ${path.resolve(argv.file)} does not exist.`)
  }
  !argv.i && !COMMAND_NAMES.includes(commands[0]) && fatal(`invalid command ${commands[0]}`)
}

