import { Button, Dimensions, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { User, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import CustomText from '../components/CustomText'
import CustomButton from '../components/CustomButton'

const AccountDetails = () => {

  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [usernameForm, setUsernameForm] = useState(false)

  // Code in useEffect() below based on the following: https://stackoverflow.com/questions/67676186/why-is-auth-onauthstatechangedtriggered-multiple-times
  useEffect(() => {
    const authListener = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setUserInfo(user)
        if (user.email) {
          setUserEmail(user.email)
        }
      }
    })

    return authListener()
  }, [])

  const changePassword = async () => {
    try {
      if (userInfo) {
        await sendPasswordResetEmail(FIREBASE_AUTH, userEmail)
        alert('Password reset email sent!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const sendVerificationEmail = async (user: User) => {
    if (user.emailVerified) {
      alert("Email already verified!")
    } else {
      await sendEmailVerification(user)
      alert("Verification email sent! Please log out and check your email.")
    }
  }

  const validateUsername = () => {
    // Matches username with length between 5 and 15 of any alphanumeric characters
    const regex = /^[a-zA-Z0-9]{5,15}$/
    const valid = regex.test(username)
    if (!valid) {
      alert('Username is not valid!\nUsername must be 5-15 characters that are lowercase letters, uppercase letters, or digits.')
      setUsername('')
    }
    return valid
  }

  const changeUsername = async () => {
    if (userInfo && validateUsername()) {
      await updateProfile(userInfo, { displayName: username })
    }
    setUsername('')
    setUsernameForm(false)
  }

  return (
    /* Use of TouchableWithoutFeedback to dismiss keyboard based on the following: https://www.geeksforgeeks.org/how-to-dismiss-the-keyboard-in-react-native-without-clicking-the-return-button/ */
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.container}>
          {usernameForm ? (
            <>
              <View>
                <CustomText>Set New Username:</CustomText>
                <TextInput style={styles.input} placeholder='Enter username' autoCapitalize='none' onChangeText={(text) => setUsername(text)} />
              </View>
              <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', marginTop: 15, marginBottom: 7.5 }} onPress={changeUsername}>Submit</CustomButton>
              <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', margin: 7.5 }} onPress={() => setUsernameForm(false)}>Cancel</CustomButton>
            </>
          ) : (
            <>
              <View style={{ rowGap: 10, marginBottom: 30 }}>
                <CustomText style={{ fontSize: 20, color: 'white' }}>Username:{'\n'}{userInfo?.displayName || 'N/A'}</CustomText>
                <CustomText style={{ fontSize: 20, color: 'white' }}>Email:{'\n'}{userInfo?.email}</CustomText>
              </View>
              <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', margin: 7.5 }} onPress={() => userInfo && sendVerificationEmail(userInfo)}>Verify Email</CustomButton>
              <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', margin: 7.5 }} onPress={() => setUsernameForm(true)}>Change Username</CustomButton>
              <CustomButton style={{ borderRadius: 5, backgroundColor: '#e4ab00', margin: 7.5 }} onPress={changePassword}>Change Password</CustomButton>
            </>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default AccountDetails

const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '50%',
    width: '80%',
    backgroundColor: '#6B6C6C',
    shadowColor: '#e4ab00',
    shadowRadius: 10,
    shadowOpacity: 0.25,
    borderRadius: 10
  },
  input: {
    alignSelf: 'center',
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    width: windowWidth * (1 / 2),
    backgroundColor: '#fff',
    fontFamily: 'Orbitron_400Regular'
  }
})