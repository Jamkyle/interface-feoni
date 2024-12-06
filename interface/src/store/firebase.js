import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

import firebaseJson from '../firebaseconfig.json'

const firebaseConfig = firebaseJson

// const firebaseConfig = {
//   apiKey: "AIzaSyD5VsOspNrkr7konEZwV6XYVWBRNhFWWBs",
//   authDomain: "hiraapp-e0dac.firebaseapp.com",
//   databaseURL: "https://hiraapp-e0dac.firebaseio.com"
// }

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)