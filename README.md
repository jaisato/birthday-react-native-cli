# birthday-react-native-cli

React Native (CLI) app for managing birthdays, backed by Firebase.

## Security

- **Compromised Firebase config:** the Firebase web config (API key `AIzaSy...aAIw`, project `birthday-55ce4`) was committed to this repository and **remains in the git history**, so it must be treated as compromised. Restrict the API key in the [Google Cloud console](https://console.cloud.google.com/apis/credentials) (application and API restrictions, or regenerate it) and review your Firebase security rules (Realtime Database/Firestore/Storage) so data access does not rely on the key being secret.
- **Firebase config setup:** the config no longer lives in source. Copy `src/utils/firebaseConfig.example.js` to `src/utils/firebaseConfig.js` and fill in your real values. `src/utils/firebaseConfig.js` is gitignored — do not commit it.
- **Android release signing:** `android/app/build.gradle` signs the release build with the shared debug keystore. Generate and configure a private release keystore before publishing.
- **Outdated platform:** upgrade React Native from 0.62 to a current release, and raise `targetSdkVersion` from 28 to 34+ (required by Google Play).
