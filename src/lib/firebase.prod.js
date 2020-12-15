import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { config } from './firebase.config.prod.js' // .gitignored for security, as a dev how to make one
//import { seedDatabase } from '../seed'

// need to somehow seed the database

const firebase = Firebase.initializeApp(config)
// !!!!!!!!!!!!!!!! DO NOT UN-COMMENT THIS SEED !!!!!!!!!!!!!
// You will make duplicate data if this is ran again.
// seedDatabase(firebase)
// !!!!!!!!!!!!!!!! DO NOT UN-COMMENT THIS SEED !!!!!!!!!!!!!

export { firebase }
