import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";

import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import API from "../services/api";

export default function HomeScreen() {
  const [customerName, setCustomerName] = useState("");

  const [address, setAddress] = useState("");

  const [phone, setPhone] = useState("");

  const [seller, setSeller] = useState("");

  const [sellers, setSellers] = useState<any[]>([]);

  const [productSearch, setProductSearch] = useState("");

  const [allProducts, setAllProducts] = useState<any[]>([]);

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const [productModalVisible, setProductModalVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSellers();

    fetchProducts();
  }, []);

  // FETCH SELLERS

  const fetchSellers = async () => {
    try {
      const response = await API.get("/users/sellers");

      setSellers(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH PRODUCTS

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products/active");

      setAllProducts(response.data);
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to fetch products");
    }
  };

  // FILTER PRODUCTS

  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) =>
      item.productName?.toLowerCase().includes(productSearch.toLowerCase()),
    );
  }, [allProducts, productSearch]);

  // ADD PRODUCT TO ORDER

  const addToOrder = (product: any) => {
    const alreadyExists = selectedProducts.find(
      (item) => item.product === product._id,
    );

    if (alreadyExists) {
      return Alert.alert("Already Added", "Product already added");
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        product: product._id,
        productName: product.productName,
        uom: product.uom,
        rate: product.rate,
        quantity: "1",
      },
    ]);
  };

  // UPDATE QUANTITY

  const updateQuantity = (index: number, quantity: string) => {
    const updated = [...selectedProducts];

    updated[index].quantity = quantity;

    setSelectedProducts(updated);
  };

  // REMOVE PRODUCT

  const removeProduct = (index: number) => {
    const updated = [...selectedProducts];

    updated.splice(index, 1);

    setSelectedProducts(updated);
  };

  const resetForm = () => {
    setCustomerName("");

    setAddress("");

    setPhone("");

    setSeller("");

    setSelectedProducts([]);

    setProductSearch("");
  };

  // TOTAL AMOUNT

  const totalAmount = selectedProducts.reduce((sum, item) => {
    return sum + Number(item.rate) * Number(item.quantity);
  }, 0);

  // SUBMIT ORDER

  const submitOrder = async () => {
    try {
      if (!customerName) {
        return Alert.alert("Validation", "Customer name is required");
      }

      if (!seller) {
        return Alert.alert("Validation", "Please select seller");
      }

      if (selectedProducts.length === 0) {
        return Alert.alert("Validation", "Please select products");
      }

      setSubmitting(true);

      const payload = {
        customerName,
        address,
        phone,
        seller,

        detail: selectedProducts.map((item) => ({
          productId: item.product,
          productName: item.productName,
          uom: item.uom,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
        totalAmount: totalAmount,
        status: "submitted",
        postedBy: "guest",
      };

      console.log("Submitting Order:", payload);

      await API.post("/orders", payload);

      Alert.alert("Success", "Order submitted successfully");

      // RESET

      setCustomerName("");

      setAddress("");

      setPhone("");

      setSeller("");

      setSelectedProducts([]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactUs = () => {
    Linking.openURL("tel:+923087387998");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainHeading}>Shoaib Traders</Text>

      {/* CUSTOMER DETAILS */}

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

      {/* SELLER */}

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={seller}
          onValueChange={(itemValue) => setSeller(itemValue)}
        >
          <Picker.Item label="Select Seller" value="" />

          {sellers.map((item) => (
            <Picker.Item
              key={item._id}
              label={item.fullName}
              value={item.fullName}
            />
          ))}
        </Picker>
      </View>

      {/* PRODUCT SEARCH */}

      <Text style={styles.heading}>Products</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setProductModalVisible(true)}
      >
        <Text style={styles.buttonText}>+ Add Product</Text>
      </TouchableOpacity>

      {/* SELECTED PRODUCTS */}

      {selectedProducts.length > 0 && (
        <>
          <Text style={styles.heading}>Selected Products</Text>

          {selectedProducts.map((item, index) => (
            <View key={index} style={styles.selectedProductCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.productName}</Text>

                <Text>Rate: Rs. {item.rate}</Text>
              </View>

              <TextInput
                value={item.quantity}
                onChangeText={(value) => updateQuantity(index, value)}
                keyboardType="numeric"
                style={styles.quantityInput}
              />

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeProduct(index)}
              >
                <Text style={styles.buttonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* TOTAL */}

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Amount</Text>

            <Text style={styles.totalAmount}>Rs. {totalAmount}</Text>
          </View>
        </>
      )}

      {/* SUBMIT */}

      <View style={styles.actionContainer}>
        {/* SUBMIT BUTTON */}

        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            submitting && {
              opacity: 0.7,
            },
          ]}
          onPress={submitOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Order</Text>
          )}
        </TouchableOpacity>

        {/* RESET BUTTON */}

        <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleContactUs}
      >
        <Text style={styles.buttonText}>Contact Us</Text>
      </TouchableOpacity>

      {/* LOGIN */}

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginText}>Registered User? Login</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      <Modal visible={productModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Select Product</Text>

          {/* SEARCH */}

          <TextInput
            placeholder="Search Product"
            style={styles.input}
            value={productSearch}
            onChangeText={setProductSearch}
          />

          {/* PRODUCTS */}

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => {
                  addToOrder(item);

                  setProductModalVisible(false);
                }}
              >
                <View>
                  <Text style={styles.productName}>{item.productName}</Text>

                  <Text style={styles.productInfo}>UOM: {item.uom}</Text>

                  <Text style={styles.productInfo}>Rate: Rs. {item.rate}</Text>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* CLOSE */}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setProductModalVisible(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: "#fff",
  },

  mainHeading: {
    fontSize: 28,
    color: "#007bff",
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 5,
    textAlign: "center",
  },

  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },

  submitButton: {
    flex: 1,
  },

  resetButton: {
    backgroundColor: "#6c757d",
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,

    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
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

  productCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },

  productInfo: {
    color: "#555",
  },

  addProductButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },

  selectedProductCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,

    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  quantityInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: 60,
    height: 45,
    textAlign: "center",
    borderRadius: 8,
  },

  removeButton: {
    backgroundColor: "red",
    width: 40,
    height: 40,
    borderRadius: 8,

    justifyContent: "center",
    alignItems: "center",
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginTop: 20,
    marginBottom: 20,
  },

  totalText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },

  loginButton: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
  },

  loginText: {
    color: "green",
    fontSize: 16,
    fontWeight: "600",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
});
