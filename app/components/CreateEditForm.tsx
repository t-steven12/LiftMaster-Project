import { Button, Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig'
import { DocumentData, DocumentReference, QueryDocumentSnapshot, addDoc, collection, updateDoc } from 'firebase/firestore'
import { User, onAuthStateChanged } from 'firebase/auth'
import { Dimensions } from 'react-native'
import CustomButton from './CustomButton'
import CustomText from './CustomText'

type currentLift = {
  currLiftSnapshot: QueryDocumentSnapshot | undefined
  updateList: () => void
}

const CreateEditForm = ({ currLiftSnapshot, updateList }: currentLift) => {

  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [liftForm, setLiftForm] = useState<boolean>(false)
  const [liftName, setLiftName] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [sets, setSets] = useState<string>('')
  const [reps, setReps] = useState<string>('')
  const [oneRepMax, setOneRepMax] = useState<string | number>('N/A')


  useEffect(() => {
    setLiftName(currLiftSnapshot?.data().liftName)
    setWeight(currLiftSnapshot?.data().weight.toString())
    setSets(currLiftSnapshot?.data().sets.toString())
    setReps(currLiftSnapshot?.data().reps.toString())
  }, [currLiftSnapshot])

  // Code below involving onAuthStateChanged() based on the Stackoverflow answers in the following: https://stackoverflow.com/questions/42762443/how-can-i-unsubscribe-to-onauthstatechanged
  const authListiner = onAuthStateChanged(FIREBASE_AUTH, (user) => {
    if (user) setUserInfo(user)
  });

  authListiner();

  const editLift = async () => {
    if (userInfo) {
      if (validateValues(weight, reps, sets) && currLiftSnapshot !== undefined) {
        try {
          const today = new Date()
          await updateDoc(currLiftSnapshot.ref, { liftName: liftName.toLowerCase(), weight: parseInt(weight), sets: parseInt(sets), reps: parseInt(reps), oneRepMax: oneRepMax })
          setLiftForm(!liftForm)
          // Update the lifts list to reflect the updated lift
          updateList()
          alert('Lift updated!')
        } catch (error) {
          console.log('Updating lift in database failed: ' + error)
        } finally {
          Keyboard.dismiss()
        }
      } else {
        alert('Invalid weight, sets, or reps values! Re-fill the form and submit again.')
        setWeight('')
        setSets('')
        setReps('')
      }
    } else {
      alert('User is signed out')
    }
  }

  const validateValues = (weight: string, sets: string, reps: string): boolean => {
    if (weight === '' || sets === '' || reps === '') {
      return false
    } else {
      let weightCharacters = weight.split('')
      let setsCharacters = sets.split('')
      let repsCharacters = reps.split('')
      for (const index in weightCharacters) {
        if (isNaN(parseInt(weightCharacters[index]))) {
          return false
        }
      }
      for (const index in setsCharacters) {
        if (isNaN(parseInt(setsCharacters[index]))) {
          return false
        }
      }
      for (const index in repsCharacters) {
        if (isNaN(parseInt(repsCharacters[index]))) {
          return false
        }
      }
      if (weight.startsWith('0') || sets.startsWith('0') || reps.startsWith('0')) {
        return false
      }
      if (isNaN(parseInt(weight)) || isNaN(parseInt(sets)) || isNaN(parseInt(reps))) {
        return false
      }
      return true
    }
  }

  const calculate1RM = () => {
    let oneRM: string | number = "N/A"
    if (weight !== '' && reps !== '') {
      if (parseInt(reps) > 1) {
        // Epley 1RM formula
        oneRM = Math.round(parseInt(weight) * (1 + (parseInt(reps) / 30)))
      } else if (parseInt(reps) == 1) {
        oneRM = parseInt(weight)
      }
    }
    setOneRepMax(oneRM)
  }

  useEffect(() => {
    calculate1RM()
  }, [weight, reps])

  return (
    <>
      {/* Use of TouchableWithoutFeedback to dismiss keyboard based on the following: https://www.geeksforgeeks.org/how-to-dismiss-the-keyboard-in-react-native-without-clicking-the-return-button/ */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior='padding' style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View>
            <Text style={styles.header}>Edit Lift</Text>
          </View>
          <View style={styles.textBoxContainer}>
            <TextInput
              placeholder='Lift name'
              style={{ ...styles.textBox }}
              placeholderTextColor={'#848686'}
              value={liftName}
              maxLength={50}
              onChangeText={text => setLiftName(text)}
            />
          </View>
          <View style={styles.textBoxContainer}>
            <TextInput
              placeholder='Weight in Lbs'
              style={{ ...styles.textBox }}
              placeholderTextColor={'#848686'}
              value={weight}
              inputMode='numeric'
              maxLength={4}
              onChangeText={text => setWeight(text)}
            />
          </View>
          <View style={styles.textBoxContainer}>
            <TextInput
              placeholder='Sets'
              style={{ ...styles.textBox }}
              placeholderTextColor={'#848686'}
              value={sets}
              inputMode='numeric'
              maxLength={3}
              onChangeText={text => setSets(text)}
            />
          </View>
          <View style={styles.textBoxContainer}>
            <TextInput
              placeholder='Reps'
              style={{ ...styles.textBox }}
              placeholderTextColor={'#848686'}
              value={reps}
              inputMode='numeric'
              maxLength={3}
              onChangeText={text => setReps(text)}
            />
          </View>
          <View style={{ alignItems: 'center', margin: 8 }}>
            <CustomText style={{ color: 'white' }}>Estimated</CustomText>
            <CustomText style={{ color: 'white' }}>One-Rep Max(1RM)*:</CustomText>
            <CustomText style={{ color: 'white' }}>{oneRepMax} lbs</CustomText>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <CustomButton style={styles.submitAndCancelButtonsContainer} onPress={editLift}>Submit</CustomButton>
          </View>
          <View>
            <CustomText style={{ fontSize: 9, margin: 15 }}>*Based on the Epley formula for calculating one-rep max estimates which uses the weight lifted and the repetitions performed; please use the 1RM value generated purely as an estimate</CustomText>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default CreateEditForm

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