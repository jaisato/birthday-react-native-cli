import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import moment from 'moment';
import AddBirthday from './AddBirthday';
import ActionBar from './ActionBar';
import Birthday from './Birthday';
import firebase from '../utils/firebase';
import 'firebase/firestore';

firebase.firestore().settings({experimentalForceLongPolling: true});
const db = firebase.firestore(firebase);

export default function ListBirthday(props) {
  const {user} = props;
  const [showList, setShowList] = useState(true);
  const [birthday, setBirthday] = useState([]);
  const [pasatBirthday, setPasatBirthday] = useState([]);
  // A counter rather than a boolean flag. The flag had to be cleared after each
  // reload, and clearing it was itself a state change the effect depended on:
  // deleting an entry set it to undefined, the effect ran and fetched, then set
  // it back to false, which the effect saw as another change and fetched a
  // second time. Bumping a counter is one change per request to reload.
  const [reloadData, setReloadData] = useState(0);

  useEffect(() => {
    let current = true;

    setBirthday([]);
    setPasatBirthday([]);
    db.collection(user.uid)
      .orderBy('dateBirth', 'asc')
      .get()
      .then((response) => {
        // A reload that finishes after another has started - or after the
        // screen is gone - must not write its now-stale rows.
        if (!current) {
          return;
        }

        const itemsArray = [];
        response.forEach((doc) => {
          const data = doc.data();
          data.id = doc.id;
          itemsArray.push(data);
        });
        formatData(itemsArray);
      })
      .catch((error) => {
        // Nothing caught this: offline, or rules denying the read, surfaced as
        // an unhandled rejection and the list simply stayed empty with no
        // indication anything had failed.
        console.error('No se pudieron cargar los cumpleaños', error);

        if (current) {
          Alert.alert(
            'Error',
            'No se han podido cargar los cumpleaños. Revisa tu conexión.',
          );
        }
      });

    return () => {
      current = false;
    };
  }, [reloadData]);

  /** Asks the effect above for a fresh read. */
  const reload = () => setReloadData((count) => count + 1);

  const formatData = (items) => {
    const currentDate = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const birthdayTempArray = [];
    const pasatBirthdayTempArray = [];

    items.forEach((item) => {
      const dateBirth = new Date(item.dateBirth.seconds * 1000);
      const dateBrithday = moment(dateBirth);
      const currentYear = moment().get('year');
      dateBrithday.set({year: currentYear});

      const diffDate = currentDate.diff(dateBrithday, 'days');
      const itemTemp = item;
      itemTemp.dateBirth = dateBrithday;
      itemTemp.days = diffDate;

      if (diffDate <= 0) {
        birthdayTempArray.push(itemTemp);
      } else {
        pasatBirthdayTempArray.push(itemTemp);
      }
    });

    setBirthday(birthdayTempArray);
    setPasatBirthday(pasatBirthdayTempArray);
  };

  const daleteBirthday = (birthday) => {
    Alert.alert(
      'Eliminar cumpleaños',
      `¿Estas seguro de eliminar el cumpleaños de ${birthday.name} ${birthday.lastname}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            db.collection(user.uid)
              .doc(birthday.id)
              .delete()
              .then(reload)
              .catch((error) => {
                console.error('No se pudo eliminar el cumpleaños', error);
                Alert.alert('Error', 'No se ha podido eliminar el cumpleaños.');
              });
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      {showList ? (
        <ScrollView style={styles.scrollView}>
          {/* Keyed by document id. Both lists are rendered as siblings and both
              used to key by their own array index, so the first upcoming and
              the first past birthday were both key 0 - duplicate keys among
              siblings, which React resolves by reusing the wrong element. */}
          {birthday.map((item) => (
            <Birthday
              key={item.id}
              birthday={item}
              daleteBirthday={daleteBirthday}
            />
          ))}
          {pasatBirthday.map((item) => (
            <Birthday
              key={item.id}
              birthday={item}
              daleteBirthday={daleteBirthday}
            />
          ))}
        </ScrollView>
      ) : (
        <AddBirthday
          user={user}
          setShowList={setShowList}
          setReloadData={reload}
        />
      )}
      <ActionBar showList={showList} setShowList={setShowList} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: '100%',
  },
  scrollView: {
    marginBottom: 50,
    width: '100%',
  },
});
