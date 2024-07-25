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
  import { Dimensions } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import auth from '@react-native-firebase/auth';
  import firestore from '@react-native-firebase/firestore';
  
  const SignUpScreen = () => {
    const navigation = useNavigation();
    const { height, width } = Dimensions.get('window');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  
    const handleSignUp = async () => {
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
  
      if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
  
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
  
        await firestore().collection('users').doc(user.uid).set({
          name: name,
          email: email,
        });
  
        console.log('User account created & signed in!');
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => navigation.navigate("LoginScreen") }
        ]);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Error', 'That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'That email address is invalid!');
        } else {
          Alert.alert('Error', error.message);
        }
        console.error(error);
      }
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image source={require('../assets/logo.png')} />
          <Text style={styles.title}>Sign Up Your Account</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={(text) => setName(text)}
            />
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
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  };
  
  export default SignUpScreen;
  
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
    signUpButton: {
      backgroundColor: 'black',
      height: 50,
      width: '100%',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    signUpButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loginContainer: {
      flexDirection: 'row',
      marginTop: 20,
    },
    loginText: {
      textDecorationLine: 'underline',
      marginLeft: 5,
      color: 'blue',
    },
  });