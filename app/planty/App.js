import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Image, FlatList } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLoading } from "expo-app-loading";
//navigaton
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { getFirestore, collection, getDocs, where, getDoc, query, doc, getDocFromCache, setDoc } from "firebase/firestore";
//icons
import LottieView from 'lottie-react-native';

import { FlashList } from "@shopify/flash-list";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";

//delete before commiting


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const Tab = createMaterialBottomTabNavigator();
const db = getFirestore(app);

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
  function signUserOut() {
    signOut(auth, user)
    setUser(null)
  }
  const [userData, setUserData] = useState()


  const fetchData = async (email) => {

    const querySnapshot = await getDoc(doc(db, "user", email));
    setUserData(querySnapshot.data())
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


    
  }
  const theme = useTheme();
  theme.colors.secondaryContainer = "transperent"



  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState()
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [loginAlert, setLoginAlert] = useState(false)
  const [userName, setUserName] = useState("null")
  const [logOrSignIn, setLogOrSignIn] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [toDoList,setToDoList] = useState()
  const [animationStatus ,setAnimationStatus]= useState(false)
  const tabBarIconSize = 30
  const anim = useRef(null);


  const createToDoList = async (data) => {
  
  
   
   
      liste = []
      for (const i in data["plants"]) {
        
        oldDate = new Date(0)
        d = new Date()

        oldDate = new Date(data["plants"][i]["lastWatered"])



        tagUnterschied = d.toString().split(" ")[2] - oldDate.toString().split(" ")[2]
     
        if(tagUnterschied == data["plants"][i]["wateringIntervall"]){
          liste.push({name:data["plants"][i]["name"],id:i})
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

  function loginScreen() {

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} enabled behavior={"padding"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{
            flex: 1,
            alignItems: "center",
            paddingTop: 80,
            backgroundColor: "black",

          }}>
            <View>
              <Text style={{ fontFamily: "Poppins_900Black", color: "white", fontSize: 30, textAlign: "center" }}>Planty</Text>
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
                  <Text style={{ color: "black", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Login</Text>
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
              marginTop: 80,
            }}>
              <Text style={
                {
                  color: "black",
                  fontFamily: "Poppins_700Bold",
                  fontSize: 20,
                  textAlign: "center",
                }}>Log in</Text>
            </TouchableOpacity>
          </View >
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    )
  }
  function signInScreen() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{
          flex: 1,
          alignItems: "center",
          paddingTop: 80,
          backgroundColor: "black",

        }}>
          <View>
            <Text style={{ fontFamily: "Poppins_900Black", color: "white", fontSize: 30, textAlign: "center" }}>Planty</Text>
            {loginAlert ? <Text style={{ color: "red" }}>Your password is too short!</Text> : null}
          </View>
          <View style={{ width: "50%", height: 40, borderRadius: 10, flexDirection: "row", marginTop: 20 }}>
            <TouchableOpacity onPress={() => setLogOrSignIn(1)} style={{ width: "50%", justifyContent: 'center', alignItems: "center", height: "100%", backgroundColor: "#F7C945", borderBottomLeftRadius: 10, borderTopLeftRadius: 10 }}>
              <View>
                <Text style={{ color: "black", fontFamily: "Poppins_700Bold", fontSize: 18 }}>Register</Text>
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
            marginTop: 80,
          }}>
            <Text style={
              {
                color: "black",
                fontFamily: "Poppins_700Bold",
                fontSize: 20,
                textAlign: "center",
              }}>Log in</Text>
          </TouchableOpacity>
        </View >
      </TouchableWithoutFeedback>
    )
  }

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
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

    return !dataLoaded && !animationStatus ? loadingScreen() : user == null ? logOrSignIn == 0 ? loginScreen() : signInScreen()  : (
      <NavigationContainer options>
        <Tab.Navigator screenOptions={{
          headerShown: false,
          tabBarLabel: false,


        }}

          activeColor="#FFFFFF"
          inactiveColor="#FFFFFF80"
          barStyle={{ backgroundColor: 'black', maxHeight: 90 }}>
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
      </NavigationContainer>
    );

  }
  //if logged in


  function loadingScreen() {
    console.log(dataLoaded + ": " + animationStatus)
    anim.current?.play()
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <LottieView ref={anim} onAnimationFinish={(isCancled) => {
          if(!isCancled){
          dataLoaded ? setAnimationStatus(true) : anim.current?.play()
          }
        } } source={require("./assets/goiaHGkaYg.json")}  useNativeLooping={true} autoPlay={true} loop={false} style={{ width: 400, height: 400 }} />

      </View>
    )
  }
  function HomeScreen() {
    
    return (
      <View style={{ backgroundColor: "black", flex: 1, padding: 40, paddingTop: 80, }}>
        <Text style={{ color: "white", fontFamily: "Poppins_900Black", fontSize: 23, width: "90%" }}>Hello {userName}, your Plants are doing well</Text>
        <Text style={{ color: "white", fontFamily: "Poppins_600SemiBold", marginTop: 15, fontSize: 20 }}>To Do:</Text>
        <FlatList scrollEnabled={false}  data={toDoList} renderItem={( {item} ) => (
          <Text style={{color:"white",fontFamily: "Poppins_600SemiBold",fontSize:18,marginTop:10}}>● {item.name} needs to be watered</Text>
        
    )} />
        <StatusBar style="auto" />
      </View>
    );
  }

  function PlantScreen() {
    return (
      <View style={{ backgroundColor: "black", flex: 1 }}>


        <StatusBar style="auto" />
      </View>
    );
  }
  function SettingScreen() {

    return (
      <View style={{ backgroundColor: "black", flex: 1 }}>


        <StatusBar style="auto" />
      </View>
    );
  }
  function WaterScreen() {

    return (
      <View style={{ backgroundColor: "black", flex: 1 }}>


        <StatusBar style="auto" />
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
    color: "white",
    width: 300,
    borderBottomColor: "white",
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