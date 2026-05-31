import firebase from 'firebase/app';

// SECURITY: Firebase config should be loaded from environment variables.
// These keys are restricted via Firebase Security Rules and App Check,
// but should not be hardcoded in production apps.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyD2T8gv-J4XGe-DEESD6Ppwd2gDuPeaAIw',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'birthday-55ce4.firebaseapp.com',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://birthday-55ce4.firebaseio.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'birthday-55ce4',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'birthday-55ce4.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '623149673267',
  appId: process.env.FIREBASE_APP_ID || '1:623149673267:web:6d5f0865da8217bdffec46',
};

export default firebase.initializeApp(firebaseConfig);
