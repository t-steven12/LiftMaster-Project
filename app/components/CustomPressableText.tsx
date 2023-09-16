import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const CustomPressableText = (props: any) => {

  const [darkText, setDarkText] = useState(false)

  return (
    <Pressable onPress={props.onPress} onPressIn={()  => setDarkText(true)} onPressOut={() => setDarkText(false)}>
      <Text style={{...props.style, fontFamily: 'Orbitron_400Regular', margin: 8, color: darkText ? 'black' : 'white'}}>{props.children}</Text>
    </Pressable>
  )
}

export default CustomPressableText