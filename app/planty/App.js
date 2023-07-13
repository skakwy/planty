import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLoading } from "expo-app-loading";
//navigaton
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';


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

  const theme = useTheme();
  theme.colors.secondaryContainer = "transperent"

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState()
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [loginAlert, setLoginAlert] = useState(false)
  const [currentView, setCurrentView] = useState("h")
  const [userName, setUserName] = useState("null")
  const tabBarIconSize = 30
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
      return user == null ? loginScreen() :  (
        <NavigationContainer options>
          <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarLabel:false,
            
          
          }}
        
          activeColor="#FFFFFF"
          inactiveColor="#FFFFFF80"
          barStyle={{ backgroundColor: 'black',maxHeight:90 }}>
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
                <MaterialCommunityIcons name="water" color={color} size={tabBarIconSize+2} />
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


 
  function HomeScreen() {

    return (
          <View style={{ backgroundColor: "black", flex: 1,padding:70,fontFamily:"Poppins_900Black" }}>
            <Text style={{color:"white"}}>Hello {userName}, your Plants are doing well</Text>
        <StatusBar style="auto" />
      </View>
    );
  }
  function PlantScreen() {

    return (
      <View style={{ backgroundColor: "black",flex:1 }}>
      

        <StatusBar style="auto" />
      </View>
    );
  }
  function SettingScreen() {

    return (
      <View style={{ backgroundColor: "black",flex:1 }}>
      

        <StatusBar style="auto" />
      </View>
    );
  }
  function WaterScreen() {

    return (
      <View style={{ backgroundColor: "black",flex:1 }}>
      

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

