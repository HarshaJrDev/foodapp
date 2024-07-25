import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../Screens/Home';
import LoginScreen from '../AdminLogIn/LoginScreen';
import SignUp from '../Screens/SignUp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

const Stack = createStackNavigator();

export default function MyStack() {
  const [authState, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setAuthState(token);
      setLoading(false);
    };
    checkAuth();

    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        AsyncStorage.setItem('token', user.uid);
        setAuthState(user.uid);
      } else {
        // User is signed out
        AsyncStorage.removeItem('token');
        setAuthState(null);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <Stack.Navigator initialRouteName={authState ? 'Home' : 'LoginScreen'}>
        {authState ? (
          <>
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}
