import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ProductRow from "../components/ProductRow";
import API from "../services/api";

export default function HomeScreen() {
  const [trackingId, setTrackingId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [seller, setSeller] = useState("");
  const [sellers, setSellers] = useState<any[]>([]);

  const [products, setProducts] = useState([
    {
      product: "",
      quantity: "",
    },
  ]);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await API.get("/sellers");

      setSellers(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const addProductRow = () => {
    setProducts([
      ...products,
      {
        product: "",
        quantity: "",
      },
    ]);
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const updated = [...products];

    (updated[index] as any)[field] = value;

    setProducts(updated);
  };

  const submitOrder = async () => {
    try {
      const payload = {
        customerName,
        address,
        phone,
        seller,
        products,
      };

      const response = await API.post("/orders", payload);

      Alert.alert("Success", "Order submitted successfully");

      console.log(response.data);
    } catch (error: any) {
      console.log(error?.response?.data || error);

      Alert.alert("Error", "Failed to submit order");
    }
  };

  const trackOrder = async () => {
    try {
      const response = await API.get(`/orders/${trackingId}`);

      Alert.alert("Order Found", JSON.stringify(response.data.data));
    } catch (error) {
      Alert.alert("Error", "Order not found");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Track Order</Text>

      <TextInput
        placeholder="Enter Order ID"
        style={styles.input}
        value={trackingId}
        onChangeText={setTrackingId}
      />

      <TouchableOpacity style={styles.button} onPress={trackOrder}>
        <Text style={styles.buttonText}>Track Order</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Book Order</Text>

      <TextInput
        placeholder="Customer Name"
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
      />

      <TextInput
        placeholder="Address"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        placeholder="Phone"
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={seller}
          onValueChange={(itemValue) => setSeller(itemValue)}
        >
          <Picker.Item label="Select Seller" value="" />

          {sellers.map((item) => (
            <Picker.Item key={item._id} label={item.name} value={item._id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.subHeading}>Products</Text>

      {products.map((item, index) => (
        <ProductRow
          key={index}
          product={item.product}
          quantity={item.quantity}
          onChangeProduct={(value) => updateProduct(index, "product", value)}
          onChangeQuantity={(value) => updateProduct(index, "quantity", value)}
        />
      ))}

      <TouchableOpacity style={styles.secondaryButton} onPress={addProductRow}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={submitOrder}>
        <Text style={styles.buttonText}>Submit Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginText}>Registered User? Login</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
  },

  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },

  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  secondaryButton: {
    backgroundColor: "#555",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  loginButton: {
    marginTop: 20,
    alignItems: "center",
  },

  loginText: {
    color: "blue",
    fontSize: 16,
    fontWeight: "600",
  },
});
