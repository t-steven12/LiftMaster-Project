import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import CustomText from './CustomText'

const CustomButton = (props: any) => {
  const [buttonPressed, setButtonPressed] = useState(false)

  const executeOnPress = () => {
    // may need to put setButtonPressed before/after props.onPress()
    setButtonPressed(false)
    props.onPress()
  }
  return (
    <Pressable style={[props.style, styles.button]} onPressIn={() => setButtonPressed(true)} onPressOut={() => setButtonPressed(false)} onPress={() => executeOnPress()}>
      <CustomText style={{ padding: 10, color: buttonPressed ? '#E1D9D1' : 'black' }}>{props.children}</CustomText>
    </Pressable>
  )
}

export default CustomButton

const styles = StyleSheet.create({
  button: {
    height: 'auto',
    width: 'auto'
  }
})