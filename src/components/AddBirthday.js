import React, {useState} from 'react';
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
      const dateBirth = new Date(formData.dateBirth.getTime());
      dateBirth.setYear(0);
      const data = {...formData, dateBirth};
      db.collection(user.uid)
        .add(data)
        .then(() => {
          setReloadData(true);
          setShowList(true);
        })
        .catch(() => {
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
