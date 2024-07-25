import React, { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform, StyleSheet, Text, View, FlatList, TextInput, Alert, Switch, TouchableOpacity, Modal, ActivityIndicator, PermissionsAndroid, PushNotificationIOS } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel-id',
          channelName: 'Default Channel',
          channelDescription: 'A default channel for notifications',
          playSound: true,
          soundName: 'default',
          importance: PushNotification.Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`createChannel returned '${created}'`)
      );
    }

    const fetchToken = async () => {
      try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
      } catch (error) {
        console.log('Error fetching FCM token:', error);
      }
    };

    fetchToken();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground Notification:', JSON.stringify(remoteMessage));

      if (Platform.OS !== 'ios') {
        showNotification(remoteMessage.notification);
      } else {
        await PushNotificationIOS.requestPermissions();
        showNotification(remoteMessage.notification);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showNotification = (notification) => {
    if (notification) {
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: notification.title || '',
        message: notification.body || '',
      });
    }
  };

  return (
    <Home />
  );
};

const Home = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', price: '', status: false });
  const [editItem, setEditItem] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    requestUserPermission();
    fetchUserData();

    return () => {
     
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUserId(currentUser.uid);
        const subscriber = firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('menu')
          .onSnapshot(querySnapshot => {
            const items = [];
            querySnapshot.forEach(documentSnapshot => {
              items.push({
                ...documentSnapshot.data(),
                key: documentSnapshot.id,
              });
            });
            setMenuItems(items);
            setLoading(false);
          });

        return () => subscriber();
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Fetch user data error:', error);
    }
  };

  const requestUserPermission = async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        console.log('Notification permission denied');
      }
    } else if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        const granted = await messaging().requestPermission();
        const enabled =
          granted === messaging.AuthorizationStatus.AUTHORIZED ||
          granted === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', granted);
        } else {
          console.log('Notification permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const addItem = async () => {
    if (newItem.title.trim() === '' || newItem.price.trim() === '') {
      Alert.alert('Error', 'Title and Price are required');
      return;
    }

    if (userId) {
      try {
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('menu')
          .add(newItem);
        setNewItem({ title: '', description: '', price: '', status: false });
        setAddModalVisible(false);
      } catch (error) {
        console.error('Add item error:', error);
        Alert.alert('Error', 'Failed to add item');
      }
    }
  };

  const updateItem = async () => {
    if (editItem.title.trim() === '' || editItem.price.trim() === '') {
      Alert.alert('Error', 'Title and Price are required');
      return;
    }

    if (editItem && userId) {
      try {
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('menu')
          .doc(editItem.key)
          .update(editItem);
        setEditItem(null);
        setEditModalVisible(false);
      } catch (error) {
        console.error('Update item error:', error);
        Alert.alert('Error', 'Failed to update item');
      }
    }
  };

  const deleteItem = (id) => {
    if (userId) {
      Alert.alert(
        'Delete Item',
        'Are you sure you want to delete this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: async () => {
            try {
              await firestore().collection('users').doc(userId).collection('menu').doc(id).delete();
            } catch (error) {
              console.error('Delete item error:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }},
        ],
        { cancelable: false }
      );
    }
  };

  const toggleStatus = async (item) => {
    if (userId) {
      try {
        await firestore().collection('users').doc(userId).collection('menu').doc(item.key).update({
          status: !item.status
        });
      } catch (error) {
        console.error('Toggle status error:', error);
        Alert.alert('Error', 'Failed to toggle status');
      }
    }
  };

  const signOut = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await auth().signOut();
        await AsyncStorage.removeItem('token');
        setMenuItems([]);
        navigation.navigate('SignUp');
      } else {
        console.warn('No user is currently signed in.');
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const openEditModal = (item) => {
    setEditItem({ ...item });
    setEditModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.price}>Rs.{item.price}</Text>
            <Switch
              value={item.status}
              onValueChange={() => toggleStatus(item)}
              thumbColor={item.status ? '#4CAF50' : '#FF5252'}
              trackColor={{ false: '#FF5252', true: '#4CAF50' }}
            />
            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => openEditModal(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteItem(item.key)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      <Modal visible={isAddModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Menu Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newItem.title}
            onChangeText={(text) => setNewItem({ ...newItem, title: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newItem.description}
            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={newItem.price}
            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Active</Text>
            <Switch
              value={newItem.status}
              onValueChange={(value) => setNewItem({ ...newItem, status: value })}
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={addItem}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setAddModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Menu Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={editItem?.title}
            onChangeText={(text) => setEditItem({ ...editItem, title: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={editItem?.description}
            onChangeText={(text) => setEditItem({ ...editItem, description: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={editItem?.price}
            onChangeText={(text) => setEditItem({ ...editItem, price: text })}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Active</Text>
            <Switch
              value={editItem?.status}
              onValueChange={(value) => setEditItem({ ...editItem, status: value })}
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={updateItem}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#777777',
    marginVertical: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signOutButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default App;
