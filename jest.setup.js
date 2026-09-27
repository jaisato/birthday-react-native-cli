/* eslint-env jest */
/**
 * Jest setup, run before every test file ("jest.setupFiles" in package.json).
 *
 * Jest resolves firebase to its Node build (Metro uses the browser build), and
 * the Node build of Firestore loads the native `grpc` addon, which has no
 * prebuilt binary for current Node versions and fails to compile - so the smoke
 * test died on import. Tests must not reach Firebase anyway: the SDK side
 * effects are replaced by an app whose auth never reports a user.
 */
jest.mock('firebase/auth', () => ({}));
jest.mock('firebase/firestore', () => ({}));

jest.mock('./src/utils/firebase', () => {
  const query = {
    get: () => new Promise(() => {}),
    add: () => new Promise(() => {}),
    doc: () => ({delete: () => new Promise(() => {})}),
  };

  return {
    auth: () => ({
      onAuthStateChanged: () => () => {},
      signInWithEmailAndPassword: () => new Promise(() => {}),
      createUserWithEmailAndPassword: () => new Promise(() => {}),
      signOut: () => Promise.resolve(),
    }),
    firestore: () => ({
      settings: () => {},
      collection: () => query,
    }),
  };
});
