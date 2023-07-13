import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLoading } from "expo-app-loading";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";

//delete before commiting
const firebaseConfig = {
  apiKey: "AIzaSyDJRe3xPgWP-1cb4ZyAbtrdWpBaJSnumKg",
  authDomain: "planty-717e0.firebaseapp.com",
  projectId: "planty-717e0",
  storageBucket: "planty-717e0.appspot.com",
  messagingSenderId: "504763237812",
  appId: "1:504763237812:web:0ac3b7fcf0c80a8c999ee1",
  measurementId: "G-X9DJQYHGK6"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState()
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [loginAlert, setLoginAlert] = useState(false)
  const [currentView, setCurrentView] = useState("h")
  const HomeScreen = homeScreen()
  const PlantScreen = plantScreen()
  const SettingScreen = settingScreen()
  const WateringScreen = waterScreen()
  function loginScreen() {

    return (
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

                console.log(errorCode)
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
        //user is logged in

      } else {
        console.log("user not logged in")

      }
    });
    return homeScreen()
  }
  //if logged in
 

  function screenManager(){
   return currentView == "h" ? <HomeScreen /> : currentView == "p" ? <PlantScreen /> : currentView == "s" ? <SettingScreen /> : <WateringScreen />
  }
  function homeScreen() {

   return (  
     <View style={{backgroundColor:"black",flex:1}}>
       <View style={{position:"absolute",bottom:0,width:"100%",height:50,backgroundColor:"white"}}>

       </View>

       <StatusBar style="auto" />
     </View>
   );
 }
  function plantScreen() {

   return (  
     <View style={{backgroundColor:"black"}}>
       <View style={{positon:"aboslute",bottom:0,width:"100%",height:50,backgroundColor:"white"}}>

       </View>

       <StatusBar style="auto" />
     </View>
   );
 }
  function settingScreen() {

   return (  
     <View style={{backgroundColor:"black"}}>
       <View style={{positon:"aboslute",bottom:0,width:"100%",height:50,backgroundColor:"white"}}>

       </View>

       <StatusBar style="auto" />
     </View>
   );
 }
  function waterScreen() {

   return (  
     <View style={{backgroundColor:"black"}}>
       <View style={{positon:"aboslute",bottom:0,width:"100%",height:50,backgroundColor:"white"}}>

       </View>

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

