import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

// Code for this component based on the Stackoverflow answers in the following: https://stackoverflow.com/questions/51023593/is-there-a-way-to-set-a-font-globally-in-react-native

const CustomText = (props: any) => {
  
  return (
    <Text style={{fontFamily: 'Orbitron_400Regular' || 'Trebuchet MS', ...props.style}}>{props.children}</Text>
  )
}

export default CustomText
