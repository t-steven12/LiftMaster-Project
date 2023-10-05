import { ActivityIndicator, Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'
import React, { useEffect, useRef, useState } from 'react'
import { FIRESTORE_DB } from '../../firebaseConfig'
import { collection, query, where, getDocs, deleteDoc, QueryDocumentSnapshot, DocumentReference, DocumentData, orderBy, QuerySnapshot } from 'firebase/firestore'
import { Gesture, GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler'
import Animated, { Easing, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Entypo } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import CreateEditForm from '../components/CreateEditForm'
import CustomText from '../components/CustomText'
import { FontAwesome } from '@expo/vector-icons';
import SearchForm from '../components/SearchForm'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

// Code involved in type checking React Navigation screens based on code found here: https://reactnavigation.org/docs/typescript/
type NavProps = NativeStackScreenProps<RootStackParamList, 'Lifts'>

const Lifts = ({ route, navigation }: NavProps) => {

  const dataArray: QueryDocumentSnapshot[] = []

  const [liftsArray, setLiftsArray] = useState(dataArray)
  const [currentLiftSnapshot, setCurrentLiftSnapshot] = useState<QueryDocumentSnapshot | undefined>()
  const [firstRenderHappened, setFirstRenderHappened] = useState(false)
  const [sortByAscDate, setSortByAscDate] = useState(false)
  const [activityIndicator, setActivityIndicator] = useState(false)
  const [editOrSearchForm, setEditOrSearchForm] = useState('search')
  const searchStringRef = useRef("")

  // use can probably add/edit/remove styles using useState for a style array

  // All edit panel animation related code is based on code from the following tutorial: https://www.youtube.com/watch?v=fWHiSuz-V68&t=821s

  // Panel animation constants
  const fingerIsOnPanelEdge = useSharedValue(false)
  const { height, width } = useWindowDimensions()
  const fingerTrackingX = useSharedValue(width * 0.65)
  const navHeaderHeight = useHeaderHeight()
  const heightOfEditPanel = height - navHeaderHeight

  // Collection queries
  const liftsCollection = collection(FIRESTORE_DB, 'lifts')
  const userLiftsQuery = query(liftsCollection, where('owner', "==", route.params.userId), orderBy('date', 'desc'))
  const userLiftsQueryAsc = query(liftsCollection, where('owner', "==", route.params.userId), orderBy('date', 'asc'))

  // Animated style to make edit panel follow finger animation
  const animatedTranslationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(fingerTrackingX.value, {
          duration: 70,
          easing: Easing.linear,
        })
      }
    ]
  }))

  // Gesture handler for edit panel animation
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (e) => {
      if (e.absoluteX > (width * 0.35) && e.absoluteX < (width * 0.35 + width * 0.13)) {
        fingerIsOnPanelEdge.value = true
      } else {
        fingerIsOnPanelEdge.value = false
      }
      console.log("Window height: " + height)
      console.log("Header height: " + navHeaderHeight)
      console.log("Touch height: " + e.absoluteY)
    },
    onActive: (e) => {
      if (fingerIsOnPanelEdge.value == true && e.translationX >= 0) {
        fingerTrackingX.value = e.translationX
        console.log(e.absoluteX)
      }
    },
    onEnd: (e) => {
      if (fingerIsOnPanelEdge.value == true && e.absoluteX >= (width * 0.85)) {
        fingerTrackingX.value = width * 0.65
      } else {
        fingerTrackingX.value = 0
      }
      fingerIsOnPanelEdge.value = false
      console.log(fingerIsOnPanelEdge.value)
    }
  })

  const getUserLiftsSnapshot = async () => {
    let userLiftsSnapshot: QuerySnapshot<DocumentData, DocumentData>

    // console.log(sortByAscDate)
    // console.log(searchStringRef.current)

    // call activity indicator state in this function!
    setActivityIndicator(prev => !prev)

    if (sortByAscDate === true) {
      // search string stuff added for search form
      if (searchStringRef.current != '') {
        userLiftsSnapshot = await getDocs(query(liftsCollection, where('owner', "==", route.params.userId), where('liftName', "==", searchStringRef.current.toLowerCase()), orderBy('date', 'asc')))
      } else {
        userLiftsSnapshot = await getDocs(userLiftsQueryAsc)
      }
    } else {
      if (searchStringRef.current != '') {
        console.log("Descending search")
        userLiftsSnapshot = await getDocs(query(liftsCollection, where('owner', "==", route.params.userId), where('liftName', "==", searchStringRef.current.toLowerCase()), orderBy('date', 'desc')))
      } else {
        userLiftsSnapshot = await getDocs(userLiftsQuery)
      }
    }

    // The following code to update 'liftsArray' based on code from the following: https://www.techiediaries.com/react-usestate-hook-update-array/
    if (firstRenderHappened !== true) {
      userLiftsSnapshot.docs.forEach((lift) => {
        // console.log(lift.data().date.toDate().toLocaleDateString('en-us'))
        setLiftsArray(liftsArray => [...liftsArray, lift])
      })
    } else {
      setLiftsArray(dataArray)
      userLiftsSnapshot.docs.forEach((lift) => {
        setLiftsArray(liftsArray => [...liftsArray, lift])
      })
    }

    setActivityIndicator(prev => !prev)
  }


  useEffect(() => {
    getUserLiftsSnapshot()
    if (firstRenderHappened !== true) {
      setFirstRenderHappened(true)
    }
  }, [sortByAscDate])


  // The following deleteLift() code is based on code found in the following:
  // https://react.dev/learn/updating-arrays-in-state#removing-from-an-array
  const deleteLift = async (liftSnapshot: QueryDocumentSnapshot) => {
    try {
      await deleteDoc(liftSnapshot.ref)
      // console.log(liftSnapshot)
      setLiftsArray(liftsArray.filter(lift => lift.id !== liftSnapshot.id))
      alert("Lift has successfully been removed.")
    } catch (error) {
      console.log(error)
    }

  }


  const deleteWarning = (liftSnapshot: QueryDocumentSnapshot) => {
    const confirmDelete = Alert.alert('Confirm Delete', 'Are you sure you want to delete this lift?',
      [
        {
          text: 'Yes',
          onPress: () => deleteLift(liftSnapshot)
        },
        {
          text: 'No',
          style: 'cancel'
        }
      ])
  }


  // Opening of edit panel animation
  const setTranslationValueToZero = () => {
    fingerTrackingX.value = 0
    return 1
  }

  // functions below were added for search Form

  const openSearchForm = () => {
    setEditOrSearchForm('search')
    setTranslationValueToZero()
  }

  const openEditForm = (lift: QueryDocumentSnapshot) => {
    setEditOrSearchForm('edit')
    setCurrentLiftSnapshot(lift)
    setTranslationValueToZero()
  }


  // If search has been initiated 
  const searchLift = (liftSearchQueryString: string) => {
    console.log(liftSearchQueryString)
    // setSearchString(liftSearchQueryString)
    searchStringRef.current = liftSearchQueryString
    getUserLiftsSnapshot()
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', height: '8%' }}>
        <View style={{ ...styles.tableHeaders, width: '16%' }}>
          <Pressable style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 5 }} onPress={() => (setSortByAscDate(prev => !prev))}>
            <CustomText style={{ color: 'white', fontSize: 10 }}>Date</CustomText>
            <FontAwesome name="sort" size={24} color="black" />
          </Pressable>
        </View>
        <View style={{ ...styles.tableHeaders, width: '26%' }}>
          <Pressable style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 5 }} onPress={() => openSearchForm()}>
            <CustomText style={{ color: 'white', fontSize: 10 }}>Lift</CustomText>
            <FontAwesome name="search" size={24} color="black" />
          </Pressable>
        </View>
        <View style={{ ...styles.tableHeaders, width: '13%' }}>
          <CustomText style={{ color: 'white', fontSize: 10 }}>Lbs</CustomText>
        </View>
        <View style={{ ...styles.tableHeaders, width: '10%' }}>
          <CustomText style={{ color: 'white', fontSize: 10 }}>Sets</CustomText>
        </View>
        <View style={{ ...styles.tableHeaders, width: '10%' }}>
          <CustomText style={{ color: 'white', fontSize: 10 }}>Reps</CustomText>
        </View>
        <View style={{ ...styles.tableHeaders, width: '13%' }}>
          <CustomText style={{ color: 'white', fontSize: 10 }}>1RM{'\n'}(Lbs)</CustomText>
        </View>
        <View style={{ ...styles.tableHeaders, width: '12%' }}>
          <CustomText style={{ color: 'white', fontSize: 10 }}>Opt</CustomText>
        </View>
      </View>
      {activityIndicator ? (
        <View style={{ height: '85%' }}>
          <ActivityIndicator size={'large'} color={'#e4ab00'} style={{ height: '100%' }} />
        </View>
      ) : (
        <ScrollView>
          {liftsArray.map((lift) => (
            <View style={{ flexDirection: 'row', width: '100%', backgroundColor: '#6B6C6C' }} key={lift.id}>
              <View style={{ ...styles.cellContainers, borderWidth: 1, width: '16%' }}>
                <CustomText style={{ color: 'white', fontSize: 10 }}>
                  {lift.data().date.toDate().toLocaleDateString('en-us').replace(/(?<=\/)\d\d(?=[0-9])/, '')}
                </CustomText>
              </View>
              <ScrollView horizontal={true} contentContainerStyle={styles.cellContainers} style={{ borderWidth: 1, width: '26%' }}>
                <CustomText style={{ color: 'white', fontSize: 10 }}>
                  {lift.data().liftName}
                </CustomText>
              </ScrollView>
              <View style={{ ...styles.cellContainers, borderWidth: 1, width: '13%' }}>
                <CustomText style={{ color: 'white', fontSize: 10 }}>
                  {lift.data().weight}
                </CustomText>
              </View>
              <View style={{ ...styles.cellContainers, borderWidth: 1, width: '10%' }}>
                <CustomText style={{ color: 'white', fontSize: 10 }}>
                  {lift.data().sets}
                </CustomText>
              </View>
              <View style={{ borderWidth: 1, width: '10%', justifyContent: 'center', alignItems: 'center' }}>
                <CustomText style={{ color: 'white', fontSize: 10 }}>
                  {lift.data().reps}
                </CustomText>
              </View>
              <View style={{ borderWidth: 1, width: '13%', justifyContent: 'center', alignItems: 'center' }}>
                <CustomText style={{ color: 'white', fontSize: 10 }}>
                  {lift.data().oneRepMax}
                </CustomText>
              </View>
              {/* <View style={{ borderWidth: 1, width: '10%', maxHeight: 50, justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={styles.deleteAndEditButton} onPress={() => openEditForm(lift)}>
                  <Entypo name="edit" size={30} color="white" />
                </Pressable>
              </View> */}
              {/* <View style={{ borderWidth: 1, width: '10%', maxHeight: 50, justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={styles.deleteAndEditButton} onPress={() => deleteWarning(lift)}>
                  <Ionicons name="trash" size={30} color="white" />
                </Pressable>
              </View> */}
              <Menu style={{ borderWidth: 1, width: '12%', maxHeight: 50, justifyContent: 'center', alignItems: 'center' }}>
                <MenuTrigger customStyles={{triggerOuterWrapper: {height: "100%", width: "100%"}}} style={styles.deleteAndEditButton}>
                  <Entypo name="dots-three-vertical" size={30} color="white" />
                </MenuTrigger>
                <MenuOptions customStyles={{ optionsContainer: { width: 100 }, optionWrapper: { backgroundColor: 'white', borderWidth: 1, height: 40 } }}>
                  <MenuOption onSelect={() => openEditForm(lift)}>
                    <CustomText>Edit</CustomText>
                  </MenuOption>
                  <MenuOption onSelect={() => deleteWarning(lift)}>
                    <CustomText>Delete</CustomText>
                  </MenuOption>
                </MenuOptions>
              </Menu>
              {/* <Pressable style={styles.deleteAndEditButton} onPress={() => openEditForm(lift)}>
                  <Entypo name="edit" size={30} color="white" />
                </Pressable> */}
            </View>
          ))}
        </ScrollView>
      )}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.editPanel, animatedTranslationStyle]}>
          {editOrSearchForm == 'search' ? <SearchForm searchLift={(liftSearchQueryString: string) => searchLift(liftSearchQueryString)} /> : <CreateEditForm currLiftSnapshot={currentLiftSnapshot} updateList={() => getUserLiftsSnapshot()} />}
          <Entypo name="chevron-right" size={36} color="black" style={{ position: 'absolute', transform: [{ translateY: heightOfEditPanel / 2 - 18 }] }} />
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}

export default Lifts

const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  deleteAndEditButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editPanel: {
    position: 'absolute',
    zIndex: 10,
    right: 0,
    width: '65%',
    height: '100%',
    backgroundColor: '#6C6B6B'
  },
  tableHeaders: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    borderWidth: 1
  },
  cellContainers: {
    justifyContent: 'center', alignItems: 'center', padding: 3
  }
})