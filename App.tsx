import 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MyStack from './Navigation/stacknavigation';
const App = () => {
  return (
    <>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
    </>
  );
};

export default App;

const styles = StyleSheet.create({});
