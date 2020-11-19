/***
 * @fileoverview Yargs command module for seeding a Firestore.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Yargs command module for seeding a database.
 * seed --help will show yargs style help specific to the seed command.
 * @requires yargs/yargs
 * @requires options
 * @see videos-cli.js
 * @license MIT
 */

const  {
  pastelColor: yargsColorizer
} = require('../../yargs-colorizer')

const {
  data: options,
  stringColorizer: c,
  yargColorizer
 } = require('../options')

const buildHelp = () => {
  let help = require('yargs/yargs')(process.argv.slice(2))

  yargsColorizer(h)

  help
    .scriptName(c.cornflower(help.$0))
    .version(false)
    .usage(`${help.$0} seed [(--cf | --configFile)] [options]`)
    .help('h', c.mint('Show help for the seed command.'))
    .alias('h', 'help')
    .wrap(80)
    
  Object
  .getOwnPropertyNames(options)
  .forEach(key => (
    key === 'interactive' || h.option(options[key].shortName, options[key])
  ))

  return help
} 

exports.command = 'seed'

exports.describe = c.mint('Gathers and seeds video data (to a Firestore) via a series of youtube api requests. '
+ 'These requests are faked or real depending on the options given. The requests are derived from an array '
+ 'of terms data either from a Firestore or a local file depending on the options given. Video data '
+ 'from the requests is then amalgamated, and or written to the firestore and or dumped to a .json '
+ 'file or series of files.')

exports.builder = (yargs) => (buildHelp().showHelp(), yargs)