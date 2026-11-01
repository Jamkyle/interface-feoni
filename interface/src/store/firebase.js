import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

import firebaseJson from '../config.json'

// REACT_APP_EMULATOR=1 yarn start : tests locaux contre les émulateurs Firebase
const useEmulator = process.env.REACT_APP_EMULATOR === '1'

const firebaseConfig = useEmulator
  ? {
      apiKey: 'demo-key',
      projectId: 'demo-feoni',
      authDomain: 'localhost',
      databaseURL: 'http://127.0.0.1:9000?ns=demo-feoni',
    }
  : firebaseJson

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
// Les règles RTDB n'autorisent l'écriture sur /Traduction qu'aux uid présents dans /admins
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

if (useEmulator) {
  connectDatabaseEmulator(db, '127.0.0.1', 9000)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}
