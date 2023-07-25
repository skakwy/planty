import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Image, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLoading } from "expo-app-loading";
//navigaton
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import KeyboardAwareView from './assets/AvoidKeyboard';
import DefaultTextInput from './assets/DefaultTextInput';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { getFirestore, collection, getDocs, where, getDoc, query, doc, getDocFromCache, setDoc } from "firebase/firestore";
//icons
import LottieView from 'lottie-react-native';
import { FlatGrid } from 'react-native-super-grid';
import { FlashList } from "@shopify/flash-list";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";

//delete before commiting


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();
const db = getFirestore(app);
const colorScheme = Appearance.getColorScheme();

/*
signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("user is logged in now")
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function App() {
  if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  function signUserOut() {
    signOut(auth, user)
    setUser(null)
  }
  const [userData, setUserData] = useState()


  const fetchData = async (email) => {

    const querySnapshot = await getDoc(doc(db, "user", email));
    await setUserData(querySnapshot.data())
    setUserName(querySnapshot.data()["username"])
    //load list 
    try {
      const value = await AsyncStorage.getItem('toDoList');
      if (value != null) {
        alreadyExists = true
        setToDoList(value);

      }
    } catch (e) { }
    setDataLoaded(true)
    createToDoList(querySnapshot.data())
    updateLastEdited(querySnapshot.data())


  }
  const updateLastEdited = async (dat) => {

    list1 = []
    for (const i in dat["plants"]) {
      list1.push({ time: dat["plants"][i]["lastEdited"], id: i })
      if (i == 3) {
        break
      }
    }
    list1.sort((a, b) => a["time"] - b["time"])
    dat["lastEdited"] = list1
    setUserData(dat)
  }
  const updateData = async (dat) => {
    setUserData(dat == null ? userData : dat)
    const querySnapshot = await getDoc(doc(db, "user", userEmail));
    setUserData(querySnapshot.data())
    updateLastEdited(querySnapshot.data())
  }
  const theme = useTheme();
  theme.colors.secondaryContainer = "transparent"



  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState()
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [loginAlert, setLoginAlert] = useState(false)
  const [userName, setUserName] = useState("null")
  const [logOrSignIn, setLogOrSignIn] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [toDoList, setToDoList] = useState()
  const [animationStatus, setAnimationStatus] = useState(false)
  const tabBarIconSize = 30
  const anim = useRef(null);

  // const [firstColor,setFirstColor] = useState(colorScheme == "dark" ? "black" : "white")
  // const [secondColor,setSecondColor] = useState("white")
  // const [buttonColor,setButtonColor] = useState("#F7C945")
  // const [thirdColor,setThirdColor] = useState("#F1EEE8")
  
 


  //functions to handle data (requests)
  const createToDoList = async (data) => {
    liste = []

    for (const i in data["plants"]) {

      oldDate = new Date(0)
      d = new Date()

      oldDate = new Date(data["plants"][i]["lastWatered"])



      tagUnterschied = d.toString().split(" ")[2] - oldDate.toString().split(" ")[2]

      if (tagUnterschied >= data["plants"][i]["wateringInterval"]) {
        liste.push({ name: data["plants"][i]["name"], id: i })
      }

    }


    setToDoList(liste)


  }
  const createUser = async (email) => {
    await setDoc(doc(db, "user", email), {
      username: userName,
      plants: [],
      rooms: [],
      task: [],
    })
  }
  function getPlantsByRoom(roomName) {
    plants = []
    for (const i in userData["plants"]) {

      if (userData["plants"][i]["room"] == roomName) {
        plants.push({ id: i, name: userData["plants"][i]["name"] })
      }
    }

    return plants
  }
  function firstLetterUpperCase(str) {
    str2 = str.substring(0, 1)
    str = str.substring(1, str.length)
    str = str2.toUpperCase() + str
    return str
  }
  function betterStartsWith(word1, word2) {
    familiar = 0;
    word1 = word1.toLowerCase()
    word2 = word2.toLowerCase()
    for (const i in word1) {

      if (word2.split("").includes(word1[i])) {

        familiar++
      }
    }
    return familiar
  }
  function getTypes(search) {
    liste = []


    for (const i in userData["plants"]) {
      if (!liste.includes(userData["plants"][i]["type"])) {
        liste.push(userData["plants"][i]["type"])
      }
    }
    liste2 = []

    if (search != null) {

      while (liste.length) {
        best = null;
        for (const i in liste) {

          best = best == null ? liste[i] : betterStartsWith(liste[i], search) > betterStartsWith(best, search) ? liste[i] : best
        }
        liste2.push(best)
        liste.splice(liste.indexOf(best), 1)
      }
      return liste
    }

    return liste
  }
  const addPlant = async (roomName, type, name, wateringInterval) => {
    d = new Date()
    dat = userData
    roomName = roomName.toLowerCase()
    type = type.toLowerCase()
    dat["plants"] = [...dat["plants"], { lastEdited: d.getTime(), lastWatered: null, room: roomName, name: name, planted: null, type: type, wateringInterval: wateringInterval }]
    setUserData(dat)
    await setDoc(doc(db, "user", userEmail), dat)
    updateData(dat)
  }
  const changePlant = async (id, newName, newType, newInterval, newRoom) => {
    dat = userData
    newName = newName == null ? userData["plants"][id]["name"] : newName
    newType = newType == null ? serData["plants"][id]["type"] : newType
    newInterval = newInterval == null ? serData["plants"][id]["wateringInterval"] : newInterval
    newRoom = newRoom == null ? userData["plants"][id]["room"] : newRoom
    newRoom = newRoom.toLowerCase()
    console.log(newRoom)
    dat["plants"][id] = { lastWatered: userData["plants"][id]["lastWatered"], room: roomName, name: newName, planted: userData["plants"][id]["planted"], type: newType, wateringInterval: newInterval }
    await setDoc(doc(db, "user", userEmail), dat)
    updateData(dat)

  }
  const waterPlant = async (id) => {
    d = new Date()
    dat = userData
    dat["plants"][id]["lastWatered"] = d.getTime()
    await setDoc(doc(db, "user", userEmail), dat)
    updateData(dat)
    createToDoList(dat)
  }
  function getRooms(search) {
    liste = []


    for (const i in userData["rooms"]) {
      if (!liste.includes(userData["rooms"][i])) {
        liste.push(userData["rooms"][i])
      }
    }
    liste2 = []

    if (search != null) {

      while (liste.length) {
        best = null;
        for (const i in liste) {
          best = best == null ? liste[i] : betterStartsWith(liste[i], search) > betterStartsWith(best, search) ? liste[i] : best
        }
        liste2.push(best)
        liste.splice(liste.indexOf(best), 1)
      }
      return liste2
    }

    return liste
  }
  function AddPlantToRoomScreen({ navigation, route }) {
    const style = StyleSheet.create({
      textInput: {
        color: colorScheme == "dark" ? "white" : "black",
        fontFamily: "Poppins_600SemiBold",
        fontSize: 20,
        borderBottomColor: "#6A6A6A",
        borderBottomWidth: 1,

      }
    })
    const { roomName } = route.params
    const [typeSelection, setTypeSelection] = useState(false)
    const [roomSelection, setRoomSelection] = useState(false)
    const [types, setTypes] = useState(getTypes())
    const [typeInput, setTypeInput] = useState("")
    const [roomInput, setRoomInput] = useState(roomName)
    const [roomsRec, setRoomsRec] = useState(getRooms(roomName))
    const [nameInput, setNameInput] = useState("")
    const [wateringInput, setWateringInput] = useState("")



    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, backgroundColor: colorScheme == "dark" ? "black" : "white" }}>
          <TouchableOpacity onPress={() => {
            navigation.goBack()
          }} style={{ alignSelf: "flex-end",marginTop: colorScheme == "black" ? 15 : 0}}>
            <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontSize: 18, fontFamily: "Poppins_600SemiBold", marginRight: 40 }}>dismiss</Text>
          </TouchableOpacity>
          <View style={{ backgroundColor: colorScheme == "dark" ? "black" : "white", flex: 1, padding: 40, paddingTop: 100, gap: 10 }}>

            <View>
              <TextInput value={nameInput} placeholder='Name' onPressIn={() => {
                setTypeSelection(false)
                setRoomSelection(false)
              }} onChangeText={(value) => {
                setNameInput(value)
              }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
            </View>
            <View>
              <TextInput value={typeInput} placeholder='Type' onChangeText={(value) => {
                setTypeInput(value)
                setTypes(getTypes(value))
              }} onPressIn={() => {
                setTypeSelection(true)
                setRoomSelection(false)
              }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
              {typeSelection ? (<FlatList onRefresh={LayoutAnimation.configureNext({ duration: 300, create: { type: 'easeIn', property: "opacity" } })} horizontal data={types} renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setTypeInput(item)
                }}>
                  <View style={{ padding: 8, backgroundColor: "#0F0F0F", borderRadius: 6, width: 100, marginTop: 10, marginRight: 10 }}>
                    <Text style={{ color: colorScheme == "dark" ? "white" : "black", textAlign: "center", fontFamily: "Poppins_600SemiBold", fontSize: 15 }}>{item}</Text>
                  </View>
                </TouchableOpacity>
              )} />
              ) : null}
            </View>
            <View>
              <TextInput placeholder='Watering Interval' autoComplete="cc-number" value={wateringInput} onChangeText={(value) => setWateringInput(value)} onPressIn={() => {
                setTypeSelection(false)
                setRoomSelection(false)
              }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
            </View>
            <View>
              <TextInput value={roomInput} placeholder='Room' onChangeText={(value) => {
                setRoomInput(value)
                setRoomsRec(getRooms(value))
              }}
                onPressIn={() => {
                  setTypeSelection(false)
                  setRoomSelection(true)
                }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
              {roomSelection ? (<FlatList onRefresh={LayoutAnimation.configureNext({ duration: 300, create: { type: 'easeIn', property: "opacity" } })} horizontal data={roomsRec} renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setRoomInput(item)
                }}>
                  <View style={{ padding: 8, backgroundColor: "#0F0F0F", borderRadius: 6, maxWidth: 140, marginTop: 10, marginRight: 10 }}>
                    <Text style={{ color: colorScheme == "dark" ? "white" : "black", textAlign: "center", fontFamily: "Poppins_600SemiBold", fontSize: 15 }}>{item}</Text>
                  </View>
                </TouchableOpacity>
              )} />
              ) : null}
            </View>
            <TouchableOpacity onPress={() => {
              if (roomInput != null && typeInput != null && nameInput != null && wateringInput != null) {
                addPlant(roomInput, typeInput, nameInput, wateringInput)
                navigation.goBack()
              }

            }} style={{ padding: 10, backgroundColor: "#F7C945", justifyContent: "center", alignItems: "center", borderRadius: 6, marginTop: 380 }}>
              <Text style={{ color: colorScheme == "dark" ? "black" : "white", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Add Plant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )

  }
  function ManagePlant({ navigation, route }) {
    const { id } = route.params
    plantData = userData["plants"][id]
    roomName = plantData["room"]

    const style = StyleSheet.create({
      textInput: {
        color: colorScheme == "dark" ? "white" : "black",
        fontFamily: "Poppins_600SemiBold",
        fontSize: 20,
        borderBottomColor: "#6A6A6A",
        borderBottomWidth: 1,

      }
    })

    const [typeSelection, setTypeSelection] = useState(false)
    const [roomSelection, setRoomSelection] = useState(false)
    const [types, setTypes] = useState(getTypes(plantData["type"]))
    const [typeInput, setTypeInput] = useState(plantData["type"])
    const [roomInput, setRoomInput] = useState(roomName)
    const [roomsRec, setRoomsRec] = useState(getRooms(roomName))
    const [nameInput, setNameInput] = useState(plantData["name"])
    const [wateringInput, setWateringInput] = useState(String(plantData["wateringInterval"]))



    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, backgroundColor: colorScheme == "dark" ? "black" : "white" }}>
          <TouchableOpacity onPress={() => {
            navigation.goBack()
          }} style={{ alignSelf: "flex-end" }}>
            <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontSize: 18, fontFamily: "Poppins_600SemiBold", marginRight: 40 }}>dismiss</Text>
          </TouchableOpacity>
          <View style={{ backgroundColor: colorScheme == "dark" ? "black" : "white", flex: 1, padding: 40, paddingTop: 100, gap: 10 }}>

            <View>
              <TextInput value={nameInput} placeholder='Name' onPressIn={() => {
                setTypeSelection(false)
                setRoomSelection(false)
              }} onChangeText={(value) => {
                setNameInput(value)
              }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
            </View>
            <View>
              <TextInput value={typeInput} placeholder='Type' onChangeText={(value) => {
                setTypeInput(value)
                setTypes(getTypes(value))
              }} onPressIn={() => {
                setTypeSelection(true)
                setRoomSelection(false)
              }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
              {typeSelection ? (<FlatList onRefresh={LayoutAnimation.configureNext({ duration: 300, create: { type: 'easeIn', property: "opacity" } })} horizontal data={types} renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setTypeInput(item)
                }}>
                  <View style={{ padding: 8, backgroundColor: "#0F0F0F", borderRadius: 6, width: 100, marginTop: 10, marginRight: 10 }}>
                    <Text style={{ color: colorScheme == "dark" ? "white" : "black", textAlign: "center", fontFamily: "Poppins_600SemiBold", fontSize: 15 }}>{item}</Text>
                  </View>
                </TouchableOpacity>
              )} />
              ) : null}
            </View>
            <View>
              <TextInput placeholder='Watering Interval' autoComplete="cc-number" value={wateringInput} onChangeText={(value) => setWateringInput(value)} onPressIn={() => {
                setTypeSelection(false)
                setRoomSelection(false)
              }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
            </View>
            <View>
              <TextInput value={roomInput} placeholder='Room' onChangeText={(value) => {
                setRoomInput(value)
                setRoomsRec(getRooms(value))
              }}
                onPressIn={() => {
                  setTypeSelection(false)
                  setRoomSelection(true)
                }} placeholderTextColor={"#6A6A6A"} style={style.textInput} />
              {roomSelection ? (<FlatList onRefresh={LayoutAnimation.configureNext({ duration: 300, create: { type: 'easeIn', property: "opacity" } })} horizontal data={roomsRec} renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setRoomInput(item)
                }}>
                  <View style={{ padding: 8, backgroundColor: "#0F0F0F", borderRadius: 6, maxWidth: 140, marginTop: 10, marginRight: 10 }}>
                    <Text style={{ color: colorScheme == "dark" ? "white" : "black", textAlign: "center", fontFamily: "Poppins_600SemiBold", fontSize: 15 }}>{item}</Text>
                  </View>
                </TouchableOpacity>
              )} />
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => {
                waterPlant(id)

              }}
              style={{ backgroundColor: "#1E00FF", padding: 10, borderRadius: 6, marginTop: 370 }}>
              <Text style={{ color: "white", fontFamily: "Poppins_700Bold", fontSize: 18, textAlign: "center" }}>Water Plant</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (roomInput != null && typeInput != null && nameInput != null && wateringInput != null) {
                changePlant(id, nameInput, typeInput, wateringInput, roomInput)

                navigation.goBack()
              }

            }} style={{ padding: 10, backgroundColor: "#F7C945", justifyContent: "center", alignItems: "center", borderRadius: 6, marginTop: 10 }}>
              <Text style={{ color: colorScheme == "dark" ? "black" : "white", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Edit Plant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  function loginScreen() {

    return (
      <KeyboardAwareView useMarginTop={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{
            flex: 1,
            alignItems: "center",
            paddingTop: 80,
            backgroundColor: colorScheme == "dark" ? "black" : "white",


          }}>
            <View>
              <Text style={{ fontFamily: "Poppins_900Black", color: colorScheme == "dark" ? "white" : "black", fontSize: 30, textAlign: "center" }}>Planty</Text>
              {loginAlert ? <Text style={{ color: "red" }}>Your password is too short!</Text> : null}
            </View>
            <View style={{ width: "50%", height: 40, borderRadius: 10, flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity onPress={() => setLogOrSignIn(1)} style={{ width: "50%", justifyContent: 'center', alignItems: "center", height: "100%" }}>
                <View>
                  <Text style={{ color: "#9D9D9D", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Register</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLogOrSignIn(0)} style={{ width: "50%", justifyContent: 'center', alignItems: "center", height: "100%", backgroundColor: "#F7C945", borderTopRightRadius: 10, borderBottomRightRadius: 10 }}>
                <View>
                  <Text style={{ color: colorScheme == "dark" ? "black" : "white", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Login</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 150 }}>
              <TextInput style={styles.loginTextInput} autoComplete={"username"} onChangeText={setUserEmail} placeholderTextColor="#6A6A6A" placeholder="Email" />
              <TextInput style={styles.loginTextInput} autoComplete={"password"} onChangeText={setUserPassword} placeholderTextColor="#6A6A6A" placeholder="Password" />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <TouchableOpacity><Text style={{ color: "#6A6A6A" }}>Forgot your password ?</Text></TouchableOpacity>
                <TouchableOpacity><Text style={{ color: "#6A6A6A" }}>Server login</Text></TouchableOpacity>
              </View>
            </View>


            <TouchableOpacity onPress={() => {
              // validate email and password
              if (userEmail != "" && userPassword != "" && userPassword.length >= 7) {
                setLoginAlert(false)
                console.log("login in")
                signInWithEmailAndPassword(auth, userEmail, userPassword).then((userCredential) => {
                  // Signed in 
                  const user = userCredential.user;
                  console.log("user is logged in now")
                })
                  .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    console.log(errorCode + ": " + errorMessage)
                    if (errorCode == "auth/user-not-found") {
                      //create new account
                    }
                  })
              }
              if (!(userPassword.length >= 7)) {
                setLoginAlert(true)
              }


            }
            } style={{
              backgroundColor: "#F7C945",
              padding: 10,
              width: 300,
              borderRadius: 10,
              marginTop: 178,
            }}>
              <Text style={
                {
                  color: colorScheme == "dark" ? "black" : "white",
                  fontFamily: "Poppins_700Bold",
                  fontSize: 20,
                  textAlign: "center",
                }}>Log in</Text>
            </TouchableOpacity>
          </View >
        </TouchableWithoutFeedback>
      </KeyboardAwareView>
    )
  }
  function signInScreen() {
    return (
      <KeyboardAwareView useMarginTop={true} margin={200}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{
            flex: 1,
            alignItems: "center",
            paddingTop: 80,
            backgroundColor: colorScheme == "dark" ? "black" : "white",

          }}>
            <View>
              <Text style={{ fontFamily: "Poppins_900Black", color: colorScheme == "dark" ? "white" : "black", fontSize: 30, textAlign: "center" }}>Planty</Text>
              {loginAlert ? <Text style={{ color: "red" }}>Your password is too short!</Text> : null}
            </View>
            <View style={{ width: "50%", height: 40, borderRadius: 10, flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity onPress={() => setLogOrSignIn(1)} style={{ width: "50%", justifyContent: 'center', alignItems: "center", height: "100%", backgroundColor: "#F7C945", borderBottomLeftRadius: 10, borderTopLeftRadius: 10 }}>
                <View>
                  <Text style={{ color: colorScheme == "dark" ? "black" : "white", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Register</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLogOrSignIn(0)} style={{ width: "50%", justifyContent: 'center', alignItems: "center", height: "100%" }}>
                <View>
                  <Text style={{ color: "#9D9D9D", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Login</Text>
                </View>
              </TouchableOpacity>
            </View>


            <View style={{ marginTop: 150 }}>
              <TextInput style={styles.loginTextInput} autoComplete={"email"} onChangeText={setUserEmail} placeholderTextColor="#6A6A6A" placeholder="Email" />
              <TextInput style={styles.loginTextInput} autoComplete={"name"} onChangeText={setUserName} placeholderTextColor="#6A6A6A" placeholder="username" />
              <TextInput style={styles.loginTextInput} autoComplete={"password"} onChangeText={setUserPassword} placeholderTextColor="#6A6A6A" placeholder="Password" />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <TouchableOpacity><Text style={{ color: "#6A6A6A" }}>Server login</Text></TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => {
              // validate email and password
              if (userEmail != "" && userPassword != "" && userPassword.length >= 7) {
                setLoginAlert(false)
                console.log("login in")
                createUserWithEmailAndPassword(auth, userEmail, userPassword).then((userCredential) => {
                  // Signed in 
                  const user = userCredential.user;
                  console.log("user is logged in now")
                  createUser(userEmail)
                })
                  .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    console.log(errorCode + ": " + errorMessage)

                  })
              }
              if (!(userPassword.length >= 7)) {
                setLoginAlert(true)
              }


            }
            } style={{
              backgroundColor: "#F7C945",
              padding: 10,
              width: 300,
              borderRadius: 10,
              marginTop: 80
            }}>
              <Text style={
                {
                  color: colorScheme == "dark" ? "black" : "white",
                  fontFamily: "Poppins_700Bold",
                  fontSize: 20,
                  textAlign: "center",
                }}>Register</Text>
            </TouchableOpacity>
          </View >
        </TouchableWithoutFeedback>
      </KeyboardAwareView>
    )
  }

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  if (!fontsLoaded) {


  } else {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)

        const uid = user.uid;
        setUserEmail(user.email)
        //user is logged in

        if (userData == null) {


          console.log("load data")
          fetchData(user.email)

        }

      } else {
        setDataLoaded(true)

      }
    });

    return !dataLoaded && !animationStatus ? loadingScreen() : user == null ? logOrSignIn == 0 ? loginScreen() : signInScreen() : (
      <NavigationContainer options>
        <Stack.Navigator screenOptions={{
          headerShown: false,
          tabBarLabel: false,


        }}>
          <Stack.Screen name="tabScreen" component={TabScreen} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name='addPlantToRoomScreen' presentationStyle="fullscreen" component={AddPlantToRoomScreen} />
            <Stack.Screen name="managePlant" component={ManagePlant} />
          </Stack.Group>
        </Stack.Navigator>


      </NavigationContainer>
    );

  }
  //if logged in

  function TabScreen() {
    return (
      <Tab.Navigator screenOptions={{
        headerShown: false,
        tabBarLabel: false,


      }}

        activeColor={colorScheme == "black" ? "#FFFFFF" : "#000000"}
        inactiveColor={colorScheme == "black" ? "#FFFFFF80" : "#00000080"}
        barStyle={{ backgroundColor: colorScheme == "dark" ? "black" : "white", maxHeight: 90 }}>
        <Tab.Screen options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={tabBarIconSize} />
          ),
        }}

          name="Home" component={HomeScreen} />
        <Tab.Screen options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="leaf" color={color} size={tabBarIconSize} />
          ),
        }} name="Plants" component={PlantScreen} />
        <Tab.Screen options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="water" color={color} size={tabBarIconSize + 2} />
          ),
        }}

          name="water" component={WaterScreen} />
        <Tab.Screen options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" color={color} size={tabBarIconSize} />
          ),
        }}

          name="setting" component={SettingScreen} />

      </Tab.Navigator>
    )
  }
  function loadingScreen() {

    anim.current?.play()
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colorScheme == "dark" ? "black" : "white" }}>
        <LottieView ref={anim} onAnimationFinish={(isCancled) => {
          if (!isCancled) {
            dataLoaded ? setAnimationStatus(true) : anim.current?.play()
          }
        }} source={require("./assets/goiaHGkaYg.json")} useNativeLooping={true} autoPlay={true} loop={false} style={{ width: 400, height: 400 }} />

      </View>
    )
  }
  function HomeScreen({ navigation }) {

    return (
      <View style={{ backgroundColor: colorScheme == "dark" ? "black" : "white", flex: 1, padding: 40, paddingTop: 80, }}>
        <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_900Black", fontSize: 23, width: "90%" }}>Hello {userName}, your Plants are doing well</Text>
        {toDoList == null ? null :
          <View>
            <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_600SemiBold", marginTop: 15, fontSize: 20 }}>To Do:</Text>
            <FlatList scrollEnabled={false} data={toDoList} renderItem={({ item }) => (
              <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_600SemiBold", fontSize: 18, marginTop: 10 }}>● {item.name} needs to be watered</Text>

            )} />
          </View>
        }
        <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_600SemiBold", marginTop: 15, fontSize: 20 }}>Recent</Text>
        {userData["lastEdited"] == null ? null : <FlatGrid scrollEnabled={false} style={{ width: "100%", marginTop: 5 }} data={userData["lastEdited"]} renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("managePlant", {
            id: item.id
          })}>
            <View style={{ backgroundColor: "#F1EEE8", padding: 7, width: 130, borderRadius: 6, marginRight: 18 }}>
              <Text style={{ color: "black", fontFamily: "Poppins_600SemiBold", fontSize: 18 }}>{firstLetterUpperCase(userData["plants"][item.id]["name"])}</Text>
            </View>
          </TouchableOpacity>
        )} />
        }

        <StatusBar style="light" />
      </View>
    );
  }

  function PlantScreen({ navigation }) {

    return (
      <View style={{ backgroundColor: colorScheme == "dark" ? "black" : "white", flex: 1, padding: 40, paddingTop: 80, }}>

        <FlatList
          scrollEnabled={false}
          style={{ width: "100%" }}
          data={userData["rooms"]}
          renderItem={({ item }) => (
            <View style={{ width: "100%", marginTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_800ExtraBold", fontSize: 20 }}>{firstLetterUpperCase(item)}</Text>
                <TouchableOpacity onPress={() => {
                  navigation.navigate('addPlantToRoomScreen', {
                    roomName: item
                  });
                }}>
                  <MaterialCommunityIcons allowFontScaling style={{ fontWeight: "900" }} size={25} name='plus' color={"white"} />
                </TouchableOpacity>
              </View>
              <FlatList
                scrollEnabled
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 15 }}
                extraData={userData} // Add the extraData prop here
                data={getPlantsByRoom(item)}
                renderItem={(item2) => (
                  <TouchableOpacity onPress={() => navigation.navigate("managePlant", {
                    id: item2.item.id
                  })}>
                    <View style={{ backgroundColor: "#F1EEE8", padding: 7, width: 150, borderRadius: 6, marginRight: 18 }}>
                      <Text style={{ color: "black", fontFamily: "Poppins_600SemiBold", fontSize: 19 }}>{firstLetterUpperCase(item2.item.name)}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        />



        <StatusBar style="light" />
      </View>
    );
  }
  function SettingScreen({ navigation }) {
    const [wateringAlertchecked, setWateringAlertchecked] = useState(true)
    return (
      <View style={{ backgroundColor: colorScheme == "dark" ? "black" : "white", flex: 1, padding: 40, paddingTop: 80, justifyContent: "space-between" }}>
        <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_900Black", fontSize: 30 }}>Settings</Text>
        <View style={{ justifyContent: "space-between", height: 200, marginBottom: 100 }}>
          <DefaultTextInput style={{color:colorScheme == "black" ? "white" : "black",borderBottomColor:colorScheme == "black" ? "white" : "black"}} editable={false} value={userData["username"]} placeholder={"name"} />
          <DefaultTextInput style={{color:colorScheme == "black" ? "white" : "black",borderBottomColor:colorScheme == "black" ? "white" : "black"}} editable={false} value={userEmail} placeholder={"email"} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_400Regular", fontSize: 18 }}>Watering Alerts</Text>
            <BouncyCheckbox isChecked={wateringAlertchecked} fillColor='black' unfillColor='#2B2B2B' size={28} ></BouncyCheckbox>
          </View>

        </View>
        <View style={{ flexDirection: "row", width: "100%", gap: 5, justifyContent: "center" }}>
          <TouchableOpacity onPress={() => {
            signUserOut()
            setUser(null)
          }} style={{ flex: 1, backgroundColor: "#CF4E4E", padding: 10, borderRadius: 12, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_700Bold", fontSize: 16 }}>Sign out</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            console.log("delete account")
          }} style={{ flex: 1, backgroundColor: "#CF4E4E", padding: 10, borderRadius: 12, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: colorScheme == "dark" ? "white" : "black", fontFamily: "Poppins_700Bold", fontSize: 16 }}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }
  function WaterScreen({ navigation }) {

    return (
      <View style={{ backgroundColor: colorScheme == "dark" ? "black" : "white", flex: 1 }}>


        <StatusBar style="light" />
      </View>
    );
  }

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginTextInput: {
    color: colorScheme == "dark" ? "white" : "black",
    width: 300,
    borderBottomcolor: colorScheme == "dark" ? "white" : "black",
    borderBottomWidth: 0.5,
    fontSize: 18,
    padding: 5,
    marginTop: 60,
    fontFamily: "Poppins_400Regular",

  }

});

function getDaysBetweenDates(startDate, endDate) {
  // Calculate the time difference in milliseconds
  const timeDiff = endDate.getTime() - startDate.getTime();

  // Convert milliseconds to days
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}