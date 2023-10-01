import { Button, Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig'
import { DocumentData, DocumentReference, QueryDocumentSnapshot, addDoc, collection, updateDoc } from 'firebase/firestore'
import { User, onAuthStateChanged } from 'firebase/auth'
import { Dimensions } from 'react-native'
import CustomButton from './CustomButton'

type SearchFormProps = {
  searchLift: (liftSearchQueryString: string) => void
}
const SearchForm = ({ searchLift }: SearchFormProps) => {

  const [searchString, setSearchString] = useState('')

  return (
    <>
      {/* Use of TouchableWithoutFeedback to dismiss keyboard based on the following: https://www.geeksforgeeks.org/how-to-dismiss-the-keyboard-in-react-native-without-clicking-the-return-button/ */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior='padding' style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View>
            <Text style={styles.header}>Search Lift</Text>
          </View>
          <View style={styles.textBoxContainer}>
            <TextInput
              placeholder='Lift name'
              style={{ ...styles.textBox }}
              placeholderTextColor={'#848686'}
              value={searchString}
              maxLength={50}
              onChangeText={text => setSearchString(text)}
            />
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <CustomButton style={styles.submitAndCancelButtonsContainer} onPress={() => searchLift(searchString)}>Submit</CustomButton>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default SearchForm

const styles = StyleSheet.create({
  header: {
    fontSize: Dimensions.get('window').width * 0.06,
    fontFamily: 'Orbitron_400Regular'
  },
  textBoxContainer: {
    borderWidth: 2,
    borderRadius: 4,
    height: 40,
    margin: 5,
    width: Dimensions.get('window').width / 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textBox: {
    height: 'auto',
    width: 'auto',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontFamily: 'Orbitron_400Regular',
    padding: 5
  },
  submitAndCancelButtonsContainer: {
    margin: 10,
    height: 30,
    width: 80,
    justifyContent: 'center',
    backgroundColor: '#e4ab00',
    borderRadius: 5
  }
})