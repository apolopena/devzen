/***
 * @fileoverview Yargs option objects for videos-cli.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Modularizes options for the videos-cli command line tool.
 * @requires path
 * @requires yargs-colorizer
 * @license MIT
 */

const path = require('path')
const c = require('../yargs-colorizer').pastelColorStrings
const stubRoot = path.resolve(__dirname, '../../test/stub/network-response/')

module.exports = {
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