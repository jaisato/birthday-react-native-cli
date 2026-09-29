import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import firebase from '../utils/firebase';
import 'firebase/firestore';

firebase.firestore().settings({experimentalForceLongPolling: true});
const db = firebase.firestore(firebase);

export default function AddBirthday(props) {
  const {user, setShowList, setReloadData} = props;
  const [formData, setFormData] = useState({});
  const [isDatePicketVisible, setIsDatePicketVisible] = useState(false);
  const [formError, setFormError] = useState({});
  // Set while a write is in flight. Nothing stopped a second tap on "Crear
  // cumpleaños" before the first add() resolved, and each tap stored its own
  // document - the same birthday listed twice. A ref, because it has to be
  // seen by a tap delivered before the next render.
  const saving = useRef(false);

  const hideDatePicker = () => {
    setIsDatePicketVisible(false);
  };

  const showDatePicker = () => {
    setIsDatePicketVisible(true);
  };

  const handlerConfirm = (date) => {
    // A copy, not the picker's own Date: `const dateBirth = date` aliased it,
    // so the setHours/setMinutes calls below were editing an object the picker
    // still holds.
    const dateBirth = new Date(date.getTime());
    dateBirth.setHours(0, 0, 0, 0);
    setFormData({...formData, dateBirth});
    hideDatePicker();
  };

  const onChange = (e, type) => {
    setFormData({...formData, [type]: e.nativeEvent.text});
  };

  const onSubmit = () => {
    if (saving.current) {
      return;
    }

    let errors = {};
    if (!formData.name || !formData.lastname || !formData.dateBirth) {
      if (!formData.name) errors.name = true;
      if (!formData.lastname) errors.lastname = true;
      if (!formData.dateBirth) errors.dateBirth = true;
    } else {
      // The stored date carries only the day and month - ListBirthday reassigns
      // the year to the current one before comparing - so the year is flattened
      // on the way out. It has to be flattened on a copy: `const data =
      // formData` aliased the state object, and `data.dateBirth.setYear(0)`
      // then edited the very Date the form is rendering. On a failed write the
      // component stayed mounted and re-rendered from setFormError below, so
      // the field the user had filled in with their own date silently changed
      // to "1 de enero de 1900" - the date was gone and the retry saved 1900.
      //
      // The year it is flattened to has to be a leap year. It used to be
      // setYear(0), i.e. 1900, which is not one: 29 February rolled over to
      // 1 March 1900, so anyone born on 29 February was stored - and then
      // listed every year - as born on 1 March. 2000 keeps every day of the
      // year; ListBirthday no longer relies on the stored year for ordering.
      const dateBirth = new Date(formData.dateBirth.getTime());
      dateBirth.setFullYear(2000);
      const data = {...formData, dateBirth};
      saving.current = true;
      db.collection(user.uid)
        .add(data)
        .then(() => {
          setReloadData(true);
          setShowList(true);
        })
        .catch(() => {
          saving.current = false;
          setFormError({name: true, lastname: true, dateBirth: true});
        });
    }
    setFormError(errors);
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={[styles.input, formError.name && {borderColor: '#940c0c'}]}
          placeholder="Nombre"
          placeholderTextColor="#969696"
          onChange={(e) => onChange(e, 'name')}
        />
        <TextInput
          style={[styles.input, formError.lastname && {borderColor: '#940c0c'}]}
          placeholder="Apellidos"
          placeholderTextColor="#969696"
          onChange={(e) => onChange(e, 'lastname')}
        />
        <View
          style={[
            styles.input,
            styles.datepicker,
            formError.dateBirth && {borderColor: '#940c0c'},
          ]}>
          <Text
            style={{
              color: formData.dateBirth ? '#fff' : '#969696',
              fontSize: 18,
            }}
            onPress={showDatePicker}>
            {formData.dateBirth
              ? moment(formData.dateBirth).format('LL')
              : 'Fecha de nacimiento'}
          </Text>
        </View>
        <TouchableOpacity onPress={onSubmit}>
          <Text style={styles.addButton}>Crear cumpleaños</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePicketVisible}
        mode="date"
        onConfirm={handlerConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 50,
    color: '#fff',
    width: '80%',
    marginBottom: 25,
    backgroundColor: '#1e3040',
    paddingHorizontal: 20,
    borderRadius: 50,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#1e3040',
  },
  datepicker: {
    justifyContent: 'center',
  },
  addButton: {
    fontSize: 18,
    color: '#fff',
  },
});
