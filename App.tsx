import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './app/screens/Login';
// NavigationContainer needs to wrap entire app and manages multiple screens
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { FIREBASE_AUTH } from './firebaseConfig';
import Dashboard from './app/screens/Dashboard';
import Lifts from './app/screens/Lifts';
import AccountDetails from './app/screens/AccountDetails';
import { useFonts, Orbitron_400Regular } from '@expo-google-fonts/orbitron';
import * as SplashScreen from 'expo-splash-screen'
import * as ScreenOrientation from 'expo-screen-orientation'

// Code for this component/file based on the following tutorials by Simon Grimm:
// 1. https://www.youtube.com/watch?v=ONAVmsGW6-M&t=1172s
// 2. https://www.youtube.com/watch?v=TwxdOFcEah4&t=1225s

// Code for hiding splashscreen while fonts load below based on code found in the following: https://docs.expo.dev/develop/user-interface/fonts/
SplashScreen.preventAutoHideAsync();

// Code involved in type checking React Navigation screens based on code found here: https://reactnavigation.org/docs/typescript/
export type RootStackParamList = {
  Dashboard: { userId: string } | undefined
  Details: undefined
  Lifts: { userId: string | undefined }
  AccountDetails: undefined
}

const Stack = createNativeStackNavigator()

const InsideStack = createNativeStackNavigator<RootStackParamList>()

function InsideLayout({ route }: any) {
  return (
    <InsideStack.Navigator screenOptions={{ contentStyle: { backgroundColor: '#3D3E3E' } }}>
      <InsideStack.Screen name='Dashboard' component={Dashboard} options={{ headerShown: true, headerTitle: (route.params.userName ? route.params.userName : 'N/A') + "'s Dashboard", headerTitleStyle: { fontFamily: 'Orbitron_400Regular' }, headerStyle: { backgroundColor: '#e4ab00' }, headerShadowVisible: false, headerTintColor: 'black', headerBackTitleVisible: false }} />
      <InsideStack.Screen name='Lifts' component={Lifts} options={{ gestureEnabled: false, headerTitle: 'Your Lifts', headerTitleStyle: { fontFamily: 'Orbitron_400Regular' }, headerStyle: { backgroundColor: '#e4ab00' }, headerShadowVisible: false, headerTintColor: 'black', headerBackTitleVisible: false }} />
      <InsideStack.Screen name='AccountDetails' component={AccountDetails} options={{ headerTitle: 'Your Account Details', headerTitleStyle: { fontFamily: 'Orbitron_400Regular' }, headerStyle: { backgroundColor: '#e4ab00' }, headerShadowVisible: false, headerTintColor: 'black', headerBackTitleVisible: false }} />
    </InsideStack.Navigator>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)


  // May need to remove this useEffect and setUser() inside the login component
  // However, keeping user continously logged in may not work
  // Maybe lock away pages if user is unverified
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user)
      setUser(user)
    })

  }, [])

  // Code for hiding splashscreen while Google fonts load below based on code found in the following: https://docs.expo.dev/develop/user-interface/fonts/
  // Font used from Google Fonts: https://fonts.google.com/specimen/Orbitron
  const [fontsLoaded, fontError] = useFonts({
    Orbitron_400Regular
  })

  const onReadyRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <NavigationContainer onReady={onReadyRootView}>
      <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: '#3D3E3E' } }}>
        {user ? (<Stack.Screen name='Inside' component={InsideLayout} options={{ headerShown: false }} initialParams={{ userName: user.displayName }} />) :
          (<Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
