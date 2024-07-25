import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  selectItems,
  selectTotalPrice,
} from '../slices/cartSlice';
import Entypo from 'react-native-vector-icons/Entypo';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const items = useSelector(selectItems);
  const totalPrice = useSelector(selectTotalPrice);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.itemDetails}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text>Size: {item.size}</Text>
        <Text>Color: {item.color}</Text>
        <Text>Price: Rs.{item.price}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => dispatch(decreaseQuantity(item.id))}
            style={styles.roundButton}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <View>
            <Text>{item.quantity}</Text>
          </View>
          <TouchableOpacity
            onPress={() => dispatch(increaseQuantity(item.id))}
            style={styles.roundButton}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch(removeItem(item.id))}
            style={styles.roundButtonCross}>
            <Entypo name="cross" size={15} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleCheckout = () => {
    const productTitles = items.map(item => ({ title: item.title, quantity: item.quantity }));
    navigation.navigate('Location', { products: productTitles });
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={items}
          renderItem={renderItem}
          // keyExtractor={item => item.id.toString()}
        />
        <View style={styles.containerPrice}>
          <Text style={{ color: "gray", fontSize: 20 }}>Total Price:</Text>
          <Text style={styles.price}>Rs.{totalPrice.toFixed(2)}</Text>
        </View>
        {items.length > 0 && (
          <View>
            <TouchableOpacity
              onPress={handleCheckout}
              style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>CheckOut</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width:80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  itemDetails: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roundButtonCross: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 16, // half of the width and height to make it round
    marginHorizontal: 8,
    marginLeft: 100,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  roundButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 16, // half of the width and height to make it round
    marginHorizontal: 8,
    marginRight: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  containerPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    marginLeft: 180, // Adjust margin as needed for proper spacing
    fontSize: 20,
  },
  checkoutButton: {
    height: 50,
    backgroundColor: "#000",
    borderRadius: 10,
    borderWidth: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
  },
});

export default CartScreen;
