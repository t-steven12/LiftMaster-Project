import { View, Text, Button, TextInput, KeyboardAvoidingView, StyleSheet, Pressable, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'
import { addDoc, collection } from 'firebase/firestore'
import { Unsubscribe, User, onAuthStateChanged, sendEmailVerification } from 'firebase/auth'
import CustomText from '../components/CustomText'
import CustomButton from '../components/CustomButton'
import CustomPressableText from '../components/CustomPressableText'
import { useIsFocused } from '@react-navigation/native'

// Code for this component/file based on the following tutorials by Simon Grimm:
// 1. https://www.youtube.com/watch?v=ONAVmsGW6-M&t=1172s
// 2. https://www.youtube.com/watch?v=TwxdOFcEah4&t=1225s

// Code involved in type checking React Navigation screens based on code found here: https://reactnavigation.org/docs/typescript/
export type NavProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>

// Maybe display logged in email at the top

const Dashboard = ({ navigation }: NavProps) => {

  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [liftForm, setLiftForm] = useState<boolean>(false)
  const [liftName, setLiftName] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [sets, setSets] = useState<string>('')
  const [reps, setReps] = useState<string>('')
  const [oneRepMax, setOneRepMax] = useState<string | number>("N/A")

  // The following 17 lines are based on code from the useIsFocused hook documentation found here: https://reactnavigation.org/docs/function-after-focusing-screen/#re-rendering-screen-with-the-useisfocused-hook
  const isFocused = useIsFocused()

  useEffect(() => {
    // The following lines using "authListener" and onAuthStateChanged() are based on code from the following: https://stackoverflow.com/questions/42762443/how-can-i-unsubscribe-to-onauthstatechanged
    const authListiner = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      // console.log("Dashboard is focused")
      navigation.setOptions({
        headerTitle: (user?.displayName || "N/A") + "'s Dashboard"
      })
      if (user) {
        setUserInfo(user)
      }
    });

    return authListiner();

  }, [isFocused])

  const logOut = () => {
    FIREBASE_AUTH.signOut()
  }

  const isUserVerified = () => {
    if (userInfo?.emailVerified) {
      return true
    } else {
      alert("User unverified! Please verify your account at your email!")
      return false
    }
  }

  const createLift = async () => {
    if (userInfo) {
      if (validateValues(weight, reps, sets)) {
        try {
          const today = new Date()
          await addDoc(collection(FIRESTORE_DB, 'lifts'), { liftName: liftName.toLowerCase(), weight: parseInt(weight), sets: parseInt(sets), reps: parseInt(reps), oneRepMax: oneRepMax, owner: userInfo.uid, date: today })
          resetAndCancelAddLiftForm()
          alert('Lift added!')
        } catch (error) {
          console.log('Adding to database failed: ' + error)
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


  const resetAndCancelAddLiftForm = () => {
    setLiftName('')
    setWeight('')
    setSets('')
    setReps('')
    setLiftForm(!liftForm)
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
    // Code below related to use of TouchableWithoutFeedback to dismiss keyboard based on code from the following: https://www.geeksforgeeks.org/how-to-dismiss-the-keyboard-in-react-native-without-clicking-the-return-button/
    // Do not style TouchableWithoutFeedback. Make container inside and style that
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.card}>
          {!liftForm ?
            (
              <>
                <CustomPressableText style={{ fontSize: 20 }} onPress={() => isUserVerified() && setLiftForm(!liftForm)}>Add A Lift</CustomPressableText>
                <CustomPressableText style={{ fontSize: 20 }} onPress={() => isUserVerified() && navigation.navigate('Lifts', { userId: userInfo?.uid })}>See Your Lifts</CustomPressableText>
                <CustomPressableText style={{ fontSize: 20, textAlign: 'center' }} onPress={() => navigation.navigate('AccountDetails')}>View/Edit Account Details</CustomPressableText>
                <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', marginTop: 20 }} onPress={() => logOut()}>Log Out</CustomButton>
              </>
            ) : (
              <>
                <KeyboardAvoidingView behavior='padding' style={{ alignItems: 'center' }}>
                  <CustomText style={styles.header}>Add Your Lift</CustomText>
                  <TextInput
                    placeholder='Lift name'
                    style={styles.textBox}
                    placeholderTextColor={'#848686'}
                    value={liftName}
                    maxLength={50}
                    onChangeText={text => setLiftName(text)}
                  />
                  <TextInput
                    placeholder='Weight in Lbs'
                    style={styles.textBox}
                    placeholderTextColor={'#848686'}
                    value={weight}
                    inputMode='numeric'
                    maxLength={4}
                    onChangeText={text => setWeight(text)}
                  />
                  <TextInput
                    placeholder='Sets'
                    style={styles.textBox}
                    placeholderTextColor={'#848686'}
                    value={sets}
                    inputMode='numeric'
                    maxLength={3}
                    onChangeText={text => setSets(text)}
                  />
                  <TextInput
                    placeholder='Reps'
                    style={styles.textBox}
                    placeholderTextColor={'#848686'}
                    value={reps}
                    inputMode='numeric'
                    maxLength={3}
                    onChangeText={text => setReps(text)}
                  />
                  <View style={{ alignItems: 'center', margin: 8 }}>
                    <CustomText style={{ color: 'white' }}>Estimated One-Rep Max(1RM)*:</CustomText>
                    <CustomText style={{ color: 'white' }}>{oneRepMax} lbs</CustomText>
                  </View>
                  <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', margin: 8 }} onPress={() => isUserVerified() && createLift()}>Submit</CustomButton>
                  <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', margin: 8 }} onPress={() => resetAndCancelAddLiftForm()}>Cancel</CustomButton>
                  <CustomText style={{ fontSize: 10, margin: 10 }}>*Based on the Epley formula for calculating one-rep max estimates which uses the weight lifted and the repitions performed; please use the 1RM value generated purely as an estimate</CustomText>
                </KeyboardAvoidingView>
              </>
            )
          }
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    color: 'white'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6B6C6C',
    shadowColor: '#e4ab00',
    shadowRadius: 10,
    shadowOpacity: 0.25,
    borderRadius: 10,
    padding: 30,
    maxWidth: '80%',
    maxHeight: '80%'
  },
  textBox: {
    borderWidth: 2,
    borderRadius: 4,
    textAlign: 'center',
    width: windowWidth / 2,
    color: 'white',
    // if you do not set the width proeprty for a TextInput, the width will automatically adjust based on text input size
    height: 40,
    margin: 8,
    fontFamily: 'Orbitron_400Regular' || 'Trebuchet MS',
    // Not adding padding to textbox makes text run outside of box
    padding: 5
  },
  logOutButton: {
    padding: 10,
    margin: 50,
    borderRadius: 30,
    backgroundColor: '#1577e8',
    shadowRadius: 5,
    shadowColor: '#707371',
    shadowOpacity: 0.3,
    shadowOffset: { height: 2, width: 0 }
  }
})

export default Dashboard