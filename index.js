// Only import react-native-gesture-handler on native platforms

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './Redux/Store';
import messaging from '@react-native-firebase/messaging'; // import your Redux store

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});
AppRegistry.registerComponent(appName, () => Root);
