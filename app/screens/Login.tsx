import { View, Text, TextInput, ActivityIndicator, StyleSheet, Button, KeyboardAvoidingView, Image, Dimensions, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import CustomButton from '../components/CustomButton'

// Code for this component/file based on the following tutorials by Simon Grimm:
// 1. https://www.youtube.com/watch?v=ONAVmsGW6-M&t=1172s
// 2. https://www.youtube.com/watch?v=TwxdOFcEah4&t=1225s

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [whatToRender, setWhatToRender] = useState('login')
  const [emailToResetPassword, setEmailToResetPassword] = useState('')
  const auth = FIREBASE_AUTH

  // Reset states when switching UI renders
  useEffect(() => {
    setEmail('')
    setPassword('')
    setUsername('')
  }, [whatToRender])


  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      alert('Sign in failed: ' + error)
      setEmail('')
      setPassword('')
    }
  }

  const signUp = async () => {
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        await sendEmailVerification(userCredential.user)
        await updateProfile(userCredential.user, { displayName: username })
        setEmail('')
        setPassword('')
        setUsername('')
        alert('Please log out and check your email to verify your address!')
      })
      .catch((error) => {
        setEmail('')
        setPassword('')
        setUsername('')
        alert('Sign up failed:' + error)
      })
  }

  const validateInputAndSignUp = () => {
    const emailValid = validateEmail()
    const usernameValid = validateUsername()
    const passwordValid = validatePassword()
    
    if(emailValid && usernameValid && passwordValid) {
      signUp()
    }

  }

  // Below email validation function code based on code found here: https://www.tutorialspoint.com/how-to-validate-email-address-using-regexp-in-javascript
  const validateEmail = () => {
    const regex = /^[a-z0-9_\.-]+@[a-z]+\.[a-z]{2,3}$/
    const valid = regex.test(email.toLowerCase())
    if (!valid) {
      alert('Email is not valid!')
      setEmail('')
    }
    return valid
  }

  // Below username validation function code based on code found here: https://www.tutorialspoint.com/how-to-validate-email-address-using-regexp-in-javascript
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

  // Below password validation function code based on code found here: https://www.tutorialspoint.com/how-to-validate-email-address-using-regexp-in-javascript
  const validatePassword = () => {
    // Matches password with length between 8 and 20 with at least 1 lowercase letter, 1 uppercase letter, 1 digit,
    // and 1 of the following special characters: !@#$*
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$*]).{8,20}$/
    const valid = regex.test(password)
    if (!valid) {
      alert('Password is not valid!\nPassword must match the following criteria:\n1. Be 8-20 characters long\n2. Have at least 1 lowercase letter\n3. Have at least 1 uppercase letter\n4. Have at least 1 digit\n5. Have at least 1 of the following special characters inside the brackets: [!@#$*]')
    }
    return valid
  }

  const sendEmailToResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email)
      alert('Check your email for password reset!')
    } catch (error) {
      alert('Could not send email!')
    } finally {
      setEmail('')
    }
  }

  const renderLogin = () => {
    switch (whatToRender) {
      case 'login':
        return (
          <>
            <TextInput value={email} placeholder="Enter email" inputMode='email' autoCapitalize='none' onChangeText={(text) => setEmail(text)} style={styles.input}></TextInput>
            <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder='Enter password' autoCapitalize='none' onChangeText={(text) => setPassword(text)} />
            <Pressable onPress={() => setWhatToRender('forgot password')}>
              <Text style={{ fontFamily: 'Orbitron_400Regular' || 'Trebuchet MS', color: '#e4ab00' }}>Forgot password?</Text>
            </Pressable>
            <CustomButton style={styles.buttons} onPress={signIn}>Login</CustomButton>
            <CustomButton style={styles.buttons} onPress={() => setWhatToRender('create account')}>Sign Up</CustomButton>
          </>
        )

      case 'create account':
        return (
          <>
            <Text style={{ fontFamily: 'Orbitron_400Regular' }}>Create your account:</Text>
            <TextInput value={username} style={styles.input} placeholder='Enter username' autoCapitalize='none' onChangeText={(text) => setUsername(text)} />
            <TextInput value={email} placeholder="Enter email" inputMode='email' autoCapitalize='none' onChangeText={(text) => setEmail(text)} style={styles.input}></TextInput>
            <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder='Enter password' autoCapitalize='none' onChangeText={(text) => setPassword(text)} />
            <CustomButton style={styles.buttons} onPress={validateInputAndSignUp}>Create Account</CustomButton>
            <CustomButton style={styles.buttons} onPress={() => setWhatToRender('login')}>Cancel</CustomButton>
          </>
        )

      case 'forgot password':
        return (
          <>
            <Text style={{ fontFamily: 'Orbitron_400Regular' }}>Send password reset email:</Text>
            <TextInput value={emailToResetPassword} placeholder="Enter email" autoCapitalize='none' onChangeText={(text) => setEmailToResetPassword(text)} style={styles.input}></TextInput>
            <CustomButton style={styles.buttons} onPress={sendEmailToResetPassword}>Send Email</CustomButton>
            <CustomButton style={styles.buttons} onPress={() => setWhatToRender('login')}>Cancel</CustomButton>
          </>
        )
    }
  }


  return (
    /* Use of TouchableWithoutFeedback to dismiss keyboard based on the following: https://www.geeksforgeeks.org/how-to-dismiss-the-keyboard-in-react-native-without-clicking-the-return-button/ */
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image style={{ width: 175, height: 175, marginBottom: 50, borderRadius: 10 }} source={require('../../assets/logo.png')} />
        <View style={styles.card}>
          <KeyboardAvoidingView behavior='padding'>
            {renderLogin()}
          </KeyboardAvoidingView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Orbitron_400Regular',
    backgroundColor: '#6B6C6C',
    shadowColor: '#e4ab00',
    shadowRadius: 10,
    shadowOpacity: 0.25,
    borderRadius: 10,
    padding: 30,
    maxWidth: '80%',
    maxHeight: '80%'
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
  },
  buttons: {
    marginTop: 20,
    height: 50,
    width: windowWidth / 2,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4ab00',
    borderRadius: 5,
    fontFamily: 'Orbitron_400Regular'
  }
})

export default Login