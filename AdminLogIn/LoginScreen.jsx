import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('Logged in user:', user);

      await AsyncStorage.setItem('token', user.uid);
      // Clear any previous user data
      await AsyncStorage.removeItem('user_data');
      
      // Fetch and store user-specific data (dummy example)
      const userData = { name: 'User', email: user.email }; // Replace with actual data fetching logic
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert(
          "Login Failed",
          "Incorrect email or password. Do you want to create an account?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Sign Up",
              onPress: () => navigation.navigate('SignUp'),
            },
          ]
        );
      } else {
        Alert.alert("Login Failed", error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../assets/logo.png')} />
        <Text style={styles.title}>Log In Your Account</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text>Don't Have an Account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'lightgray',
    height: 50,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: 'black',
    height: 50,
    width: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signupText: {
    textDecorationLine: 'underline',
    marginLeft: 5,
    color: 'blue',
  },
  logoutButton: {
    backgroundColor: 'red',
    height: 50,
    width: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
