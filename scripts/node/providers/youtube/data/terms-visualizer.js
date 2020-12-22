#!/usr/bin/env node
/***
 * @fileoverview Tool for viewing and verifying terms and title lists.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description View and or verify a term list with a titles list. Term
 * and title list files must have their contents delimited by line breaks.
 * Run the tool without a coomand or with the -h or --help option for help.
 * @requires local-console-logger.js
 * @requires yargs-colorizer.js
 * @requires chalk
 * @example 
 *  // From the command line, visualize term and title files together
 *  <code>node ./terms-tool.js show front-end-terms.txt front-end-titles.txt</code>
 * @license MIT
 */
const fs = require('fs')
const path = require('path')

const readline = require('readline')

const chalk = require('chalk')

const logger = require('../../../local-console-logger.js').console
const C = require('../cli/lib/custom-hex-colors.js').palettes.pastelOne
const c = require('../cli/lib/yargs-colorizer').pastelColorStrings
const cl = require('../cli/lib/color-console-log.js').trueColor.pastelOne
const colorizeYargs = require('../cli/lib/yargs-colorizer.js')

const VERSION = 'terms-tool 0.1.2'
const COMMAND_NAMES = ['show', 'check', 'convert']

const CMD_SHOW = {
  NAME: COMMAND_NAMES[0],
  ALIASES: ['s','view'],
  DESC: c.mint('Show terms and their corresponding titles side by side in the console.')
}

const CMD_CHECK = {
  NAME: COMMAND_NAMES[1],
  ALIASES: ['c', 'report'],
  DESC: c.mint(
    'Checks that terms and title files have the same number of items. ' +
    'Outputs a report to the console listing any differences found.'
  )
}

const CMD_CONVERT = {
  NAME: COMMAND_NAMES[2],
  ALIASES: ['C', 'makelist'],
  DESC: c.mint('Coverts terms and titles files to comma delimited lists and outputs them to the console.')
}

const failTooManyArgs = (argv_, l = logger) => {
  const problems = Array.from(argv_)
  const cmdName = problems.shift()
  const n = problems.length
  const isPlural = ( n > 1 ? true : false)

  if (n < 1) {
    throw new Error('Internal Error, no offenders.')
  }

  logger.error (
    `Error processing the command '${cmdName}'. ` +
    `There ${
      isPlural ? 'were' : 'was'} ${n} more argument${
      isPlural ? 's' : ''} than what was required.`
  )

  logger.error(
    `----> Problematic extraneous argument${
    isPlural ? 's' : ''}: ${problems}`
  )
  
  process.exit(1)
}

const parseLines = (uri) => {
  const file = path.resolve(__dirname, uri)
  return new Promise((resolve, reject) => {
    let data = []
    const fileStream = fs.createReadStream(file)

    fileStream.on('error', e => reject(e))

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    rl.on('line', (line) => {
        data.push(line);
    })
    
    rl.on('close', () => {
        resolve(data);
    })
  })
};

const processFiles = async(termsUri, titlesUri, argv) => {
  let terms, titles

  const enoentMsg = (name) => (
    (name in argv)
      ? `Error processing the command 'show'. The ${name} file does not exist: ${c.pink(argv[name])}`
      : `Internal Error: command: show: No such argv key: ${c.pink(name)}`
  )

  try {
    terms = await parseLines(termsUri)
  } catch (e) {
    e.code === 'ENOENT' && (
      logger.error(enoentMsg('terms')),
      process.exit(1)
    )
    logger.error(e)
  }

  try {
    titles = await parseLines(titlesUri)
  } catch (e) {
    e.code === 'ENOENT' && (
      logger.error(enoentMsg('titles')),
      process.exit(1)
    )
    logger.error(e)
  }

  return {terms, titles}
}

// Returns an array of indices indicating the occurance of a substring within a string
const getIndiciesOf = (source, find) => {
  if (!source) {
    return [];
  }
  if (!find) {
      return source.split('').map(function(_, i) { return i; });
  }
  var result = [];
  var i = 0;
  while(i < source.length) {
    if (source.substring(i, i + find.length) == find) {
      result.push(i);
      i += find.length;
    } else {
      i++;
    }
  }
  return result;
}

const findBadChars = (terms, titles) => {
  const badChars = [
    {name: 'comma', char: ','},
  ]
  const data = { terms, titles }

  // Create an empty object to store a report of any bad characters found in any of the data passed in
  const report = Object.entries(data).reduce((acc, item) => {
    const key = item[0]
    acc[key] = {}
    badChars.forEach(badChar => {
      acc[key][badChar.name] = { 
        char: badChar.char,
        offenders: [
        ]
      }
    })
    return acc
  }, {hasBadChars: false})

  // Populate the report
  for (const [type, values] of Object.entries(data)) {
    let line = 0
    for (const [badCharName, badCharValue] of Object.entries(report[type])) { 
      Object.values(values).forEach(item => {
        line++
        if (item.indexOf(badCharValue.char) !== -1) {
          report.hasBadChars = true
          badCharValue.offenders.push({
            type: type.slice(0, -1),
            text: item,
            line, 
            locs: getIndiciesOf(item, badCharValue.char)
          })
        }
      })
    }
  }

  return report
}

// Outputs the results of a return from findBadChars()
const reportBadChars = (badCharReport, log = logger) => {
  if (!badCharReport.hasBadChars) return
  for (const [type, values] of Object.entries(badCharReport)) {
    for (const [badCharName, badCharValue] of Object.entries(values)) {
      const len = badCharValue.offenders.length
      if (len > 0) {
        const reg = new RegExp(badCharValue.char, 'g')
        const plural = len > 1 ? true : false
        const typeName = plural ? type : type.slice(0, -1)
        const charName = ( badCharName.charAt(0).toUpperCase() + badCharName.slice(1) )
        let msg = ` Found ${chalk.cyan(len)} ${typeName} with the error: Illegal ${charName} Character`
        log.red(msg)
        badCharValue.offenders.forEach(offense => {
          const badCharRed = chalk.red(badCharValue.char)
          const many = offense.locs.length > 1 ? true: false
          log.orange(
            `    line number ${
            chalk.cyan(offense.line)}, at column${
            many ? 's' : ''} ${
            chalk.cyan(offense.locs)}`
          )
          log.white(`       ${offense.text.replace(reg, badCharRed)}`)
        })
      }
    }
  }
}

const cmdShow = async(argv) => {
  (argv._.length > 1) && failTooManyArgs(argv._)

  const {terms, titles} = await processFiles(argv.terms, argv.titles, argv)

  logger.info(`\nCreating a visual combination of ${
    terms.length} terms and ${
    titles.length} titles from the terms and titles files...`)

  if (terms.length > titles.length) {
    logger.orange('WARNING: There are more terms than titles!')
    titles.length = terms.length
  }

  if (terms.length < titles.length) {
    logger.orange('WARNING: There are more titles than terms!')
    terms.length =  titles.length
  }

  console.log('')

  for (let i = 0; i < terms.length; i++) {
    terms[i]
      ? cl.cornflower.log(`Term: ${terms[i]}`) 
      : logger.red(`Term: ${terms[i]}`) 

    titles[i] 
      ? cl.mint.log(`Title: ${titles[i]}`)
      : logger.red(`Title: ${titles[i]}`)
    
    console.log()
  }
}

const cmdCheck = async(argv) => {
  (argv._.length > 1) && failTooManyArgs(argv._)

  const MSG_START = '\nChecking terms and titles files...'
  const MSG_END = '\nChecking terms and titles files is complete.'
  
  let lengthMismatch = true

  logger.info(MSG_START)

  const {terms, titles} = await processFiles(argv.terms, argv.titles, argv)
  const charReport = findBadChars(terms, titles)

  if (charReport.hasBadChars) {
    logger.error(
      '--> Bad characters found! These must be fixed before converting or using these values. <--'
    )
    reportBadChars(charReport)
  }

  if (terms.length == titles.length) {
    lengthMismatch = false
    logger.success(`\nThe terms and titles files each had the same number of items: ${terms.length}`)
  } else {
    let mismatchCount, plural
    if (terms.length < titles.length) {
      mismatchCount = titles.length - terms.length
      plural = mismatchCount > 1 ? true : false
      logger.error(`\n--> Mismatch: The terms file had ${
        mismatchCount} item${plural ? 's' : ''} less than the titles file. <--`)
    } else {
      mismatchCount = terms.length - titles.length
      plural = mismatchCount > 1 ? true : false
      logger.error(`\n--> Mismatch: The titles file had ${
        mismatchCount} item${plural ? 's' : ''} less than the terms file. <--`)
    }
  }

  if (charReport.hasBadChars || lengthMismatch) {
    logger.red('\n--> The terms and titles files are NOT safe to convert to comma delimited lists.  <--\n')
    logger.orange('WARNING')
    logger.orange('Before converting or using these values in these files please ensure that:')
  } else {
    logger.success('SUCCESS: The terms and titles files are safe to convert to comma delimited lists.')
    logger.info(MSG_END)
    process.exit(0)
  }

  lengthMismatch && logger.orange(
    ' The number of items in each file are ' +
    'equal.'
  )
  charReport.hasBadChars && logger.orange(' All bad characters listed above are fixed.')
  logger.info(MSG_END)

}

const cmdConvert = async(argv) => {
  (argv._.length > 1) && failTooManyArgs(argv._)

  const {terms, titles} = await processFiles(argv.terms, argv.titles, argv)

  if (terms.length != titles.length) {
    logger.error('Error: Cannot convert. Titles and terms files are NOT of equal length.')
    logger.warn(`Run the 'check' command for more details ---> $node ./terms-tool.js check ${argv.titles} ${argv.terms}`)
    process.exit(1)
  }

  logger.info(`\nConverting terms and titles files to comma delimited lists...\n`)

  let termsList = terms.join(',')
  let titlesList = titles.join(',')

  logger.success(c.cornflower('Terms:'), termsList)
  console.log()
  logger.success(c.mint('Titles:'), titlesList)
}

const termsTitlesBuilder = (yargs) => {
  yargs.positional('terms', {
    describe: c.mint(
      'The path to a terms file. The path can be absolute or relative. If the path is relative, ' +
      'it must be relative to this tools location. Each title in the file must be on its own line.'
    ),
    type: 'string'
  })
  yargs.positional('titles', {
    describe: c.mint(
      'The path to a titles file. The path can be absolute or relative. If the path is relative, ' +
      'it must be relative to this tools location. Each title in the file must be on its own line.'
    ),
    type: 'string'
  })
}

const program = require('yargs/yargs')(process.argv.slice(2))
  .scriptName(c.cornflower('terms-tool'))
  .version(c.cornflower(VERSION))
  .epilog(c.shalimar('\n© 2020 Devz3n.com'))
  .command({
    command: `${CMD_SHOW.NAME} <terms> <titles>`,
    aliases: CMD_SHOW.ALIASES,
    desc: CMD_SHOW.DESC,
    builder: termsTitlesBuilder,
    handler: cmdShow
  })
  .command({
    command: `${CMD_CHECK.NAME} <terms> <titles>`,
    aliases: CMD_CHECK.ALIASES,
    desc: CMD_CHECK.DESC,
    builder: termsTitlesBuilder,
    handler: cmdCheck
  })
  .command({
    command: `${CMD_CONVERT.NAME} <terms> <titles>`,
    aliases: CMD_CONVERT.ALIASES,
    desc: CMD_CONVERT.DESC,
    builder: termsTitlesBuilder,
    handler: cmdConvert
  })
  .wrap(80)
  .demandCommand(
    1,
    1, 
    chalk.red('Error: You must use exactly one command with the proper number of required arguments.')
  )
  .help();

const main = async(p = program) => {
  const name = p.argv._[0]
  COMMAND_NAMES.includes(name) || (
    logger.error(`Invalid command: ${name}`),
    p.showHelp()
  )
}

colorizeYargs.pastelColor(program)
main(program)
// END: Main Program



