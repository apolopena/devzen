/***
 * @fileoverview CLI to Gather youtube video data, process and seed it a Firestore.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Seeds a Firestore database with various types of youtube API video data.
 * The video data is gathered and processed in batches via a combination of youtube API
 * requests such as the <code>searchlist</code> and <code>videos</code> endpoints.
 * A <code>local.env</code> file with a valid youtube API key base URL is required.
 * @requires lib/videos.js
 * @requires yargs
 * @requires chalk
 * @requires local-console-logger.js
 * @requires yargs-colorizer.js
 * @license MIT
 */

const fs = require('fs')
const path = require('path')

const yargs = require('yargs')
const chalk = require('chalk')

const sharedLibRoot = path.resolve(__dirname, '../../../')
const stubRoot = path.resolve(__dirname, '../test/stub/network-response/')
const loggerUri = path.resolve(sharedLibRoot, 'local-console-logger.js')

const logger = require(loggerUri).console
//const cl = require('./lib/color-console-log').trueColor.pastelOne
const colorizeYargs = require('./lib/yargs-colorizer.js');
const validateYargs = require('./lib/videos-validate-yargs.js')

const C = require('./lib/custom-hex-colors').palettes.pastelOne

const c = {
  rose: chalk.hex(C.rose),
  cornflower: chalk.hex(C.cornflower),
  mint: chalk.hex(C.mint),
  peach: chalk.hex(C.peach),
  shalimar: chalk.hex(C.shalimar),
  pink: chalk.hex(C.pink),
  salmon: chalk.hex(C.salmon)
}

const NAME = 'videos-cli'
const VERSION = `${NAME} 0.1.1`
const COMMAND_NAMES = ['seed']


const options = {
  interactive: {
    alias: 'interactive',
    default: false,
    describe: c.mint('Runs the tool interactively. Cannot be used in conjunction with any command.'),
    type: 'boolean'
  },
  file: {
    alias: 'file',
    describe: c.mint('Specifies a file to seed rather than gathering the search lists from the terms data in the Firestore.'),
    type: 'string'
  },
  dryRun: {
    alias: 'dryRun',
    describe: c.mint('Specifies if the seeding operation should skip https requests. Used for testing.'),
    default: false,
    type: 'boolean'
  },
  dryRunVideoCount: {
    alias: 'dryRunVideoCount',
    describe: c.mint('Fakes the number of videos received when the dryRun option is set.'),
    default: 5,
    type: 'number'
  },
  skipVideoRequests: {
    alias: ['svr', 'skipVideoRequests'],
    describe: c.mint('Skips the only the https video requests during a seeding operation. Ignored when the dryRun option is set.'),
    default: false,
    type: 'boolean'
  },
  useNetworkStub: {
    alias: ['uns','useNetworkStub'],
    describe: c.mint(`Uses fake data for https search and video requests. ` +
    `This option is ignored if the dryRun option is set. Assumes that the directory ${c.salmon(
    stubRoot)} exists and that ${c.salmon('search-list.json')} exists there for any search list requests made ` +
    `and that ${c.salmon('video-list.json')} exists there for any video requests made.`),
    default: false,
    type: 'boolean'
  }
}

const program = require('yargs/yargs')(process.argv.slice(2))
  .scriptName(c.cornflower(NAME))
  .version(c.cornflower(VERSION))
  .epilog(c.shalimar('\n© 2020 Devz3n.com'))
  .option('i', options.interactive)
  .option('f', options.file)
  .option('d', options.dryRun)
  .option('dryVideos', options.dryRunVideoCount)
  .option('s', options.skipVideoRequests)
  .option('u', options.useNetworkStub)
  .command({
    command: 'seed',
    desc: 'Seeds a Firestore',
    builder: (yargs) => {},
    handler: (argv) => {
      console.log(`SEEDING...`)
    }
  })
  .wrap(80)
  .help();

const main = async(p = program) => {
  colorizeYargs.pastelColor(program)
  validateYargs(p, process.argv, logger)
}
// BEGIN: Main Program
main(program)
// END: Main Program


