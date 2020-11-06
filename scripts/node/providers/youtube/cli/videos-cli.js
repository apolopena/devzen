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

const path = require('path')

const sharedLibRoot = path.resolve(__dirname, '../../../')
const stubRoot = path.resolve(__dirname, '../test/stub/network-response/')

const logger = require(path.resolve(sharedLibRoot, 'local-console-logger')).console
const { pastelColor, pastelColorStrings: c } = require('./lib/yargs-colorizer');
const validateYargs = require('./lib/videos/videos-validate-yargs')
const options = require('./lib/videos/options')
const C = require('./lib/custom-hex-colors').palettes.pastelOne
const seedToFiles = require('./lib/videos/index').seedToFiles

const NAME = 'videos-cli'
const VERSION = `${NAME} 0.1.2`

const program = require('yargs/yargs')(process.argv.slice(2))
  .scriptName(c.cornflower(NAME))
  .version(c.cornflower(VERSION))
  .epilog(c.shalimar('\n© 2020 Devz3n.com'))
  .option('i', options.interactive)
  .option('f', options.file)
  .option('d', options.dryRun)
  .option('dvc', options.dryRunVideoCount)
  .option('s', options.skipVideoRequests)
  .option('u', options.useNetworkStub)
  .command({
    command: 'seed',
    desc: 'Seeds a Firestore',
    builder: (yargs) => {},
    handler: (argv) => {
      seedToFiles()
    }
  })
  .wrap(80)
  .help();

const main = async(p = program) => {
  pastelColor(program)
  validateYargs(p, process.argv, logger)
}
// BEGIN: Main Program
main(program)
// END: Main Program


