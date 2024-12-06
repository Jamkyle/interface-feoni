const fs = require('fs');
require('dotenv').config('./.env');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
console.log(firebaseConfig)
fs.writeFileSync('./src/firebaseconfig.json', JSON.stringify(firebaseConfig, null, 2));
console.log('firebaseconfig.json generated successfully');
