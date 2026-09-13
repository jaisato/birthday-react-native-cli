import React, {useState, useEffect} from 'react';
import {StyleSheet, SafeAreaView, StatusBar, YellowBox} from 'react-native';
import {decode, encode} from 'base-64';
import Auth from './src/components/Auth';
import firebase from './src/utils/firebase';
import 'firebase/auth';
import ListBirthday from './src/components/ListBirthday';

if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;

YellowBox.ignoreWarnings(['Setting a timer']);

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // onAuthStateChanged returns its own unsubscribe function, and the effect
    // has to hand it back or the listener outlives the component. Under Fast
    // Refresh - which remounts this component on every save - each reload added
    // another live listener to the same auth instance, so one edit session
    // ended with a dozen of them all calling setUser on a component only one of
    // them belongs to.
    const unsubscribe = firebase.auth().onAuthStateChanged((response) => {
      setUser(response);
    });

    return unsubscribe;
  }, []);

  if (user === undefined) return null;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.background}>
        {user ? <ListBirthday user={user} /> : <Auth />}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#15212b',
    height: '100%',
  },
});
