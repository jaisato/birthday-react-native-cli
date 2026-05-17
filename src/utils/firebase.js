import firebase from 'firebase/app';

// SECURITY: Firebase config values should be provided via environment variables
// or a build-time config system (e.g., react-native-config).
// Do NOT commit real API keys to source control.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'REPLACE_WITH_ENV_VAR',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'REPLACE_WITH_ENV_VAR',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'REPLACE_WITH_ENV_VAR',
  projectId: process.env.FIREBASE_PROJECT_ID || 'REPLACE_WITH_ENV_VAR',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'REPLACE_WITH_ENV_VAR',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_WITH_ENV_VAR',
  appId: process.env.FIREBASE_APP_ID || 'REPLACE_WITH_ENV_VAR',
};

export default firebase.initializeApp(firebaseConfig);
