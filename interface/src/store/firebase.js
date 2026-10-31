import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

import firebaseJson from '../config.json'

const firebaseConfig = firebaseJson

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
// Les règles RTDB n'autorisent l'écriture sur /Traduction qu'aux uid présents dans /admins
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
