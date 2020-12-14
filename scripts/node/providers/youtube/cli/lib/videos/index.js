#!/usr/bin/env node
/***
 * @fileoverview Library for working with youtube API data
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Uses various youtube API's to gather video data in batches.
 * @see videos-cli.js
 * @license MIT
 */

const axios = require('axios').default;
const path = require('path')

const dumpPath = path.resolve(__dirname, '../../../data/dump/')
const stubPath = path.resolve(__dirname, '../../../test/stub/')
const sharedLibRoot = path.resolve(__dirname, '../../../../../')
const localUtilsUri = path.resolve(sharedLibRoot, 'local-utils.js')
const localConstantsUri = path.resolve(sharedLibRoot, 'local-constants.js')
const localFirebaseUri = path.resolve(sharedLibRoot, 'firebase/local-firebase.js')
const envPath = path.resolve(sharedLibRoot, '../local.env')

const ERR = require(localConstantsUri).errors;
const DECOR = require(localConstantsUri).decor;
const SIZE = require(localConstantsUri).numbers;
const MSG = require(localConstantsUri).messages;
const util = require(localUtilsUri).standard;
const fsUtil = require(localUtilsUri).fileSystem;

const firebaseSetup = require(localFirebaseUri)
// temp grab terms data
const frontEndTerms = require(path.resolve(stubPath, 'local-test-data.js')).frontendSearchTerms

let defaultGlobalOptions = {
  dryRun: false, 
  dryRunVideoCount: 5,
  skipVideoRequests: false,
  useNetworkStub: false,
  useSingularSearchListStub: false,
  /* TODO: implement
  writeLogToFile: false, 
  writeSearchRequestsToFiles: false,
  writeVideoRequestsToFiles: false, 
  writeFinalResultToFile: false, 
  writeFinalResultToDatabase: false,
  */
}

let globalOptions, networkStubUri, networkStub, KEY, BASE_URL

const getDefaultOptions = () => defaultGlobalOptions
const getGlobalOptions = () => globalOptions
const mergeGlobalOptions = (config) => {
  globalOptions = {...defaultGlobalOptions, ...config}
  return globalOptions
}

const getNetworkStubUri = (type) => {
  const uri = path.resolve(stubPath, `network-response/${type}-list.json`)
  return fsUtil.uriExistsSync(uri) ? uri : util.throwFatal(`Invalid URI: ${uri}`)
}
const getNetworkStub = (type) => {
  require(getNetworkStubUri(type))
}
const getNetworkStubUriSingular = (type) => {
  const uri = path.resolve(stubPath, `network-response/singular-${type}-list.json`)
  return fsUtil.uriExistsSync(uri) ? uri : util.throwFatal(`Invalid URI: ${uri}`)
}
const getNetworkStubSingular = (type) => {
  require(getNetworkStubUriSingular(type))
}

const bootstrap = (config) => {
  mergeGlobalOptions(config)

  if (!process.env.YOUTUBE_API_KEY || !process.env.YOUTUBE_API_BASE_URL) {
    const envResult = require('dotenv').config({path: envPath, encoding: 'latin1'})
    envResult.error && (
      (/ENOENT/).test(envResult.error) 
        ? util.throwFatal( ERR.ERROR_BAD_ENV_PATH + /'(.*?)'/.exec(envResult.error)[0] ) 
        : util.throwFatal(envResult.error)
    )
  }

  KEY = process.env.YOUTUBE_API_KEY
  BASE_URL = process.env.YOUTUBE_API_BASE_URL

  try {
    fsUtil.createDirIfNeeded(dumpPath, 0o744, err => err && util.throwFatal(err))
  } catch (err) { 
    console.log(`Could not create dump folder: ${err}`)
  }
}

bootstrap()

/**
 * Makes a youtube API search list request
 *
 * @param {string} term - The keywords to use for the search. Supports boolean | (OR) and boolean - (NOT). Do not escape/URI encode this string.
 * @param {object} config - Optional Axios configuration object
 * @return {Promise} A an Axios promise
 *
 * @example
 * // With async/await and error handling using the default axios config
 * try {
 *    let result = await getSearchByTerm('neat stuff')
      result.data && console.log(`received data: ${result.data})
      console.log('Success: youtube API search request')
 * } catch (e) console.log(e)
 *
 *  // With promises (and accounting for a dry run)
 *  getSearchByTerm('neat stuff')
 *   .then( res => { 
 *     console.log(`search result complete: 
 *       ${res.hasOwnProperty('data')
         ? JSON.stringify(res.data, null, 2) 
         : JSON.stringify(res, null, 2)}`)
      })
      .catch( err => {
        console.log(err)
      })
 */
const getSearchByTerm = async(term = 'cats', config) => {
  const API = 'search'
  const FUNC_NAME = 'getSearchByTerm():';
  const WARN_TERM_ENCODING_MSG = `${FUNC_NAME} Search term cannot be URI encoded before it is sent
  --> Search term has been decoded and will be encoded automatically when required.\nOffending term was: `
  const defaultConfig = { 
    q: term, 
    key: KEY,
    type: 'video',
    order: 'rating',
    part: 'snippet',
    maxResults: 50,
    relevanceLanguage: 'en'
  }
  const params = {...defaultConfig, ...config }  // merge configs, if a config is passed in takes precedence
  console.log(`\n${DECOR.HR}`)
  console.log(
    ` Performing${
        globalOptions.dryRun
        ? ' a dry run of a'
        : globalOptions.useNetworkStub ? ' a fake' : ''
      } youtube API ${API} list request`
  )
  util.isUriEncoded(term) && (
    term = decodeURI(term),
    util.warn(WARN_TERM_ENCODING_MSG + encodeURI(term))
  )
  console.log(` Sending query params: ${JSON.stringify(params, null, 2)}`)
  if (globalOptions.dryRun) {
    console.log(` --> ${MSG.DRY_RUN}, no search list http request was actually made.`);
    console.log(` --> Search term: ${term}`)
    return Promise.resolve(`search list request: ${MSG.DRY_RUN_SUCCESS}`)
  }
  if (globalOptions.useNetworkStub) {
    let networkStubUri = getNetworkStubUri(API)
    let networkStub = getNetworkStub(API)
  
    if (globalOptions.useSingularSearchListStub) { // sloppy
      networkStubUri = getNetworkStubUriSingular(API)
      networkStub =  getNetworkStubSingular(API)
    }
    console.log(`--> Using a network stub file. The the request has been faked and the response data is canned (fake).`)
    console.log(`--> Path to the canned (fake) data: ${networkStubUri}`)
    return Promise.resolve(networkStub)
  }
  return axios.get(BASE_URL + API, { maxContentLength: SIZE.ONE_MEGABYTE, params })
}

// Works good.TODO: jsdoc it
const getSearchesByTerms = async (terms = ['cats','dogs'], config) => {
  const FUNC_NAME = 'getSearchesByTerms():'
  const results = []
  let result
  let startMsg = `${FUNC_NAME} STARTING... `

  console.log(DECOR.HR_FANCY)

  if (globalOptions.dryRun) {
    startMsg += '(dry run)'
  } else if (globalOptions.useNetworkStub) {
    startMsg += '(using fake requests/responses)'
  }

  console.log(startMsg)

  try {
    for (let i = 0; i < terms.length; i++) {
      try {
        const term = terms[i].term
        result = await getSearchByTerm(term, config)
        result.data && (results.push({ data: { searchTerm: term, ...result.data } }))
        console.log(` ${FUNC_NAME} --> Success${
          globalOptions.dryRun
            ? 'for dry run'
            : ''}, ${globalOptions.useNetworkStub ? 'fake ' : ''}youtube API search list request: ${i + 1} of ${terms.length}`)
      } catch (err) {
        console.log(err) // preserves the stack trace
        return Promise.reject(`${FUNC_NAME} Failed: ${err}`)
      }
    }
    if (result.data || globalOptions.dryRun) {
      for (let i = 0; i < terms.length; i++) {
        let videoTotal = (
          globalOptions.dryRun 
            ? globalOptions.dryRunVideoCount 
            : results[i].data.items.length
        )
        if (!globalOptions.skipVideoRequests) {
          console.log(
            ` \n${
              FUNC_NAME} handling ${
              globalOptions.useNetworkStub ? '(fake)' : ''} video list requests for ${
              globalOptions.useNetworkStub ? '(fake)' : ''} search list result using the term object: ${
              JSON.stringify(terms[i], null, 2)}`
          )
          globalOptions.dryRun && console.log(`   The next ${videoTotal} video list requests will be faked since this is a dry run.\n`)
        } else {
          videoTotal = 0;
        }
        for (let j = 0; j < videoTotal; j++) {
          const videoId = globalOptions.dryRun
          ? 'DRY RUNS HAVE NO ID'
          : results[i].data.items[j].id.videoId
          try {
            console.log(`Making ${
              globalOptions.useNetworkStub ? '(fake)' : ''
            } video list request ${j + 1} of ${videoTotal}. ${
              globalOptions.dryRun 
              ? 'This is a dry run, no http request was made.'
              : ''}`
            )
            const videoResult = await getVideoListById(videoId)
            //videoResult.data && console.log(`received data: ${JSON.stringify(videoResult.data)}`) // uncomment if needed for testing
            if (!videoResult.data) {
              if (globalOptions.dryRun) {
                console.log(` No real data was returned but here is where the 
                defaultAudioLanguage would be gathered and inserted into the final results.`)
              }  else {
                console.log(` ERROR: The response for videoId: ${videoId} had no data object! defaultLanguageId was not gathered!`)
              }
            } else { // There was no dryRun and data was returned a from the http request as expected so carry on with the normal flow...
              const defaultAudioLanguage = videoResult.data.items[0].snippet.defaultAudioLanguage
              console.log(
                `  ${globalOptions.dryRun
                ? 'FAKE (dry run)'
                : `${globalOptions.useNetworkStub ? 'fake ' : ''}http ` }request successful for videoId: ${
                  JSON.stringify(results[i].data.items[j].id.videoId)
                } <--`
              )
              console.log(`inserting defaultLanguageId: '${
                  defaultAudioLanguage
                }' into the id object of the proper video item in the search results for term: ${
                  results[i].data.searchTerm}`) //non fatal error here
              results[i].data.items[j].id.defaultAudioLanguage = defaultAudioLanguage
            }
          } catch (err) {
            console.log(err)
            return Promise.reject(`async video list result FAILED for videoId: ${videoId},  ${err}`)
          }
        }
      }
    } else { 
      console.log(' ERROR: There was no data in the response from the https search list request! No video list requests will be made.')
    }
  } catch (err) {
    console.log(err)
    return Promise.reject(`${FUNC_NAME} FAILED: ${err}`)
  }
  return Promise.resolve(results)
}
// Works good. TODO: jsdoc it
const getVideoListById = (id, config) => {
  const API = 'videos'

  !id && util.throwFatal(ERR.ERROR_MISSING_VIDEO_ID)
  config && !config.hasOwnProperty('key') && throwFatal(ERR.ERROR_MISSING_VIDEO_ID_PARAM)

  // all supported parts are: 'contentDetails,localizations,player,snippet'
  const params = {
    id,
    key: KEY,
    part: 'snippet,contentDetails'
  }
  if (globalOptions.dryRun) {
    return Promise.resolve('dry run')
  }
  if (globalOptions.skipVideoRequests) {
    console.log(`globalOptions were set to skip the video request.`)
    return Promise.resolve(`Video request using videoId ${id} was skipped as specified in the globalOptions`)
  }
  if (globalOptions.useNetworkStub) {
    console.log(`--> Using a network stub file. The the request has been faked and the response data is canned (fake). `)
    console.log(`--> Path to the canned (fake) data response: ${getNetworkStubUri(API)}`)
    return Promise.resolve(getNetworkStub(API))
  }
  console.log( `  --> making a ${API.slice(0, -1)} list http request for videoId: ${id}`)
  //return axios.get(BASE_URL + 'videos', { maxContentLength: SIZE.ONE_MEGABYTE, params }) // uncomment to debug query string
  console.log(`request url: ${axios.getUri({url: BASE_URL + API, params})}`)
  return axios.get(BASE_URL + API, { maxContentLength: SIZE.ONE_MEGABYTE, params })
}

/** NOTE: THIS FUNCTION WILL BE REPLACED BY seedSearches() function.
 * Makes a series of youtube API search list requests and dumps them to timestamped files in a 
 * datestamped folder. Requires a folder named 'data' to be in the root.
 *
 * @param {string} terms - An array of keywords string to use for the searches. 
 * Keyword strings supports boolean | (OR) and boolean - (NOT). Do not escape/URI encode keyword strings.
 * @param {object} config - Optional Axios configuration object for the requests. Special name value pair 
 * <code>isDryRun: false</code> will omit the http request (for testing).
 *
 * @example
 * // With async/await and error handling using the default axios config
 * TBD
 *
 *  // With promises, using the default configuration and omitting the http request
    dumpSearchesToFiles(SEED.frontendSearchTerms, { isDryRun: true })
      .then((res) => console.log(res))
      .catch(e=>console.log(e))
 */
const dumpSearchesToFiles = async (terms, config) => {
  const FUNC_NAME = 'dumpSearchesToFiles():'
  const SUCCESS_MSG = `${FUNC_NAME} Process completed. Check the log for any possible errors. file writing error are non fatal`
  const FAILURE_MSG = `${FUNC_NAME} ABORTED, there was a failure --> `

  let dirPath;

  try {
    dirPath = path.join(dumpPath, util.dateStampFolder('search'))
    fsUtil.createDirIfNeeded(dirPath, 0o744, err => { 
      if (err) console.log('  --> ERROR, Could not create date stamped folder: ' + err)
    })
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }

  try {
    console.log(`dumpSearchesToFiles(): Starting a series of async search list requests and writing them to files...`)
    for (let i = 0; i < terms.length; i++) {
      let result;
      let fileName = util.timeStampFile(`search-list${i + 1}`, '.json')
      try {
        result = await getSearchByTerm(terms[i].term, config)
        result.data && (result.data.searchTerm = terms[i].term) // bugfix: TODO change it like it works in getSearchesByTerms
        console.log('getSearchByTerms() --> Success: youtube API search request') // TODO: do this better
        const uri = path.join(dirPath, fileName)
        await fsUtil.writeFile(uri, JSON.stringify(result.data ? result.data : result, null, 2))
          .then(success => {
            console.log(success)
          })
          // writeFile errors are caught here
          .catch(e => console.log(` ERROR --> writing file ${uri}: ${e}`))
      } catch (err) {
        console.log(err) // preserves the stack trace
        return Promise.reject(`${FAILURE_MSG}${err}`)
      }
    }
  } catch (err) {
    console.log(err)
    return Promise.reject(`${FAILURE_MSG}${err}`)
  }
  return Promise.resolve(SUCCESS_MSG)
}

 
/**
 * IMPORTANT NOTE: IN PROGRESS THIS WILL REPLACE dumpSearchesToFiles()!!!
 * Requests and writes search list results to the database and or local files.
 * A seperate video query is made for each video in the search list, and the
 * <code>defaultLanguageId</code> property is added to the data object returned.
 * The video querys can be omitted by adding <code>skipVideoQuery: true</code>
 * to the <code>config</code> argument. The https requests (queries) can be 
 * skipped by adding <code>isDryRun: true</code> to the <code>config</code> argument.
 *
 * @param {string} terms - An array of keywords string to use for the searches.
 * Keyword strings supports boolean | (OR) and boolean - (NOT). Do not escape/URI encode keyword strings.
 * @param {boolean} writeFileCb - (optional) A callback to used to write each search list query to a seperate file.
 * @param {object} - (optional) Axios configuration object for the requests.<br />
 * Special properties for this object are: <br />
 * <code>isDryRun (boolean>)</code> - If <code>true</code> the http request will be omitted (for testing)<br />
 * <code>skipVideoQuery (boolean)</code> - If <code>true</code> the video query for each search list result will be skipped.<br />
 * @return {object} An an array of objects representing the json data returned from each search and or video query made.
 * @example
 *
 *     TBD
 */
// TODO: utilize getSearchesByTerms() in the code below to handle the functionality describe in the jsdoc above.
const seedSearches = async (terms, writeFileCb, config) => {
  // temp for testing
  terms = terms.slice(0, 2)

  const FUNC_NAME = 'seedSearches():'
  const SUCCESS_MSG = `${FUNC_NAME} Process completed. Check the log for any possible errors.`
  const FAILURE_MSG = `${FUNC_NAME} ABORTED, there was a failure --> `
  
  let dirPath;

  if (typeof writeFileCb !== 'function' ) { // Allow writeToFiles to be an optional parameter
    config = writeFileCb
    writeFileCb = false
  } 

  try {
    if (writeFileCb) {
      dirPath = path.join(dumpPath, util.dateStampFolder('search'))
      fsUtil.createDirIfNeeded(dirPath, 0o744, err => { 
        if (err) console.log('  --> ERROR, Could not create date stamped folder: ' + err)
      })
    }
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }

  try {

    // main logic goes here

/*
    // TODO: test error handling
    getSearchesByTerms(terms, config)
    .then((res) => {
      // logic to write to file, and or dump to database goes here
    })
    .catch(e=>console.log(e))
*/

  } catch (err) {
    console.log(err)
    return Promise.reject(`FAIL: ${err}`)
  }
  return Promise.resolve(`SUCCESS!`)
}




// BEGIN: Testing the code
//const testConfig = { isDryRun: false, skipVideoQuery: false, } // old way

globalOptions.dryRun = false
globalOptions.skipVideoRequests = false
globalOptions.useNetworkStub = true
globalOptions.useSingularSearchListStub = true // currently throws an error when true

// Dump all requests into a single file - works good
getSearchesByTerms(frontEndTerms.slice(0,2))
  .then((responses) => {
    let merged = {responses: []}
    for (const response of responses) {
      merged.responses.push(response.data)
    }
    fsUtil.writeFile(
      path.join(
        dumpPath,
        util.timeStampFile('all-search-lists',
        '.json')
      ),
      JSON.stringify(merged, null, 2)
      )
        .then(success => console.log(success))
        .catch(e => console.log(e))
    //globalOptions.dryRun || console.log(` Final result (entire data object): ${JSON.stringify(merged, null, 2)}`)
    console.log(
      `getSearchesByTerms() ${
        globalOptions.dryRun ? 'dry run' : ''} COMPLETED. Check the log for any non fatal errors`
    )
    console.log(DECOR.HR_FANCY)
  })
  .catch(e=>console.log(e))


// testing for useNetworkStub - works
//getSearchByTerm('HTML').then(res => console.log('Search Term data received.')).catch(e => console.log(e))
//getVideoListById('DjSsd7SgIEM').then(res => console.log(`Video data received: ${JSON.stringify(res.data, null, 2)}`)).catch(e => console.log(e))


// works good, this is the big one ;)
const seedToFiles = async () => {
  let result
  try {
    result = await dumpSearchesToFiles(frontEndTerms)
  } catch (e) { 
    result = e
  }
  console.log(result.data)
}
/*
dumpSearchesToFiles(SEED.frontendSearchTerms, testDry)
  .then((res) => console.log(res))
  .catch(e=>console.log(e))
*/

// END: Testing the code
module.exports = {
  getOptions: getGlobalOptions,
  mergeOptions: mergeGlobalOptions,
  getDefaultOptions,
  seedToFiles,
  dumpSearchesToFiles,
  seedSearches
}
