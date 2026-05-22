import { Picker } from "@react-native-picker/picker";

import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppHeader from "../../components/common/AppHeader";

import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "../../services/api";

export default function OrderDetailsScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<any>(null);

  const [updating, setUpdating] = useState(false);

  const [customerName, setCustomerName] = useState("");

  const [address, setAddress] = useState("");

  const [phone, setPhone] = useState("");

  const [seller, setSeller] = useState("");

  const [sellers, setSellers] = useState<any[]>([]);

  const [products, setProducts] = useState<any[]>([]);

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const [productSearch, setProductSearch] = useState("");

  const [productModalVisible, setProductModalVisible] = useState(false);

  // FETCH ORDER DETAILS

  useEffect(() => {
    setupLoggedInUser();

    fetchOrder();

    fetchSellers();

    fetchProducts();
  }, []);

  const setupLoggedInUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // FILTER PRODUCTS

  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      item.productName?.toLowerCase().includes(productSearch.toLowerCase()),
    );
  }, [products, productSearch]);

  // FETCH ORDER

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await API.get(`/orders/${id}`);

      const order = response.data;

      setCustomerName(order.customerName || "");

      setAddress(order.address || "");

      setPhone(order.phone || "");

      setSeller(order.seller || "");

      // PRODUCTS

      const formattedProducts = order.detail.map((item: any) => ({
        product: String(item.productId),
        productName: item.productName,
        quantity: String(item.quantity),
        rate: item.rate || 0,
        uom: item.uom || "",
      }));

      setSelectedProducts(formattedProducts);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

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

      setProducts(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ADD PRODUCT

  const changeProductQuantity = (product: any, change: number) => {
    const existingIndex = selectedProducts.findIndex(
      (item) => String(item.product) === String(product._id),
    );

    if (existingIndex === -1) {
      if (change <= 0) return;

      setSelectedProducts((prev) => [
        ...prev,
        {
          product: String(product._id),
          productName: product.productName,
          quantity: "1",
          rate: product.rate,
          uom: product.uom || "",
        },
      ]);

      return;
    }

    const updated = [...selectedProducts];

    const currentQty = Number(updated[existingIndex].quantity || 0);

    const newQty = currentQty + change;

    if (newQty <= 0) {
      updated.splice(existingIndex, 1);

      setSelectedProducts(updated);

      return;
    }

    updated[existingIndex].quantity = String(newQty);

    setSelectedProducts(updated);
  };

  const getProductQuantity = (productId: string) => {
    const item = selectedProducts.find(
      (p) => String(p.product) === String(productId),
    );

    return Number(item?.quantity || 0);
  };

  const totalItems = selectedProducts.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );

  // TOTAL

  const totalAmount = selectedProducts.reduce((sum, item) => {
    return sum + Number(item.rate) * Number(item.quantity);
  }, 0);

  // UPDATE ORDER

  const updateOrder = async () => {
    try {
      if (!customerName) {
        return Alert.alert("Validation", "Customer name is required");
      }

      if (!phone) {
        return Alert.alert("Validation", "Phone number is required");
      }

      if (!seller) {
        return Alert.alert("Validation", "Seller is required");
      }

      if (selectedProducts.length === 0) {
        return Alert.alert("Validation", "Please select products");
      }

      setUpdating(true);

      const payload = {
        customerName,
        address,
        phone,
        seller,
        totalAmount,

        detail: selectedProducts.map((item) => ({
          productId: item.product,
          productName: item.productName,
          quantity: Number(item.quantity),
          rate: item.rate,
          uom: item.uom || "",
        })),
      };

      await API.put(`/orders/${id}`, payload);

      Alert.alert("Success", "Order updated successfully");

      router.back();
    } catch (error: any) {
      Alert.alert("Error", "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Order Details" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 50,
          }}
        >
          {/* CUSTOMER */}

          <View style={styles.content}>
            <Text style={styles.label}>Customer Name</Text>

            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.input}
              placeholder="Customer Name"
            />

            {/* ADDRESS */}

            <Text style={styles.label}>Address</Text>

            <TextInput
              value={address}
              onChangeText={setAddress}
              style={styles.input}
              placeholder="Address"
            />

            {/* PHONE */}

            <Text style={styles.label}>Phone</Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Phone"
            />

            {/* SELLER */}

            <Text style={styles.label}>Seller</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={seller}
                onValueChange={(value) => setSeller(value)}
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

            <Text style={styles.label}>Products</Text>

            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() => setProductModalVisible(true)}
            >
              <Text style={styles.buttonText}>+ Add Product</Text>
            </TouchableOpacity>

            {/* SELECTED PRODUCTS */}

            {(user?.designation === "producer" ||
              user?.designation === "controller") && (
              <>
                <Text style={styles.heading}>Selected Products</Text>

                {selectedProducts.map((item, index) => (
                  <View key={index} style={styles.selectedProductCard}>
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text style={styles.productName}>{item.productName}</Text>

                      <Text>Rs. {item.rate}</Text>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Rate</Text>

                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={String(item.rate || "")}
                          onChangeText={(text) => {
                            const updatedProducts = [...selectedProducts];

                            updatedProducts[index].rate = Number(text) || 0;

                            setSelectedProducts(updatedProducts);
                          }}
                          placeholder="Enter Rate"
                        />
                      </View>
                    </View>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => {
                          const updated = [...selectedProducts];

                          const currentQty = Number(
                            updated[index].quantity || 0,
                          );

                          if (currentQty > 1) {
                            updated[index].quantity = String(currentQty - 1);

                            setSelectedProducts(updated);
                          }
                        }}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>

                      <TextInput
                        value={String(item.quantity)}
                        keyboardType="numeric"
                        style={styles.qtyInput}
                        onChangeText={(text) => {
                          const updated = [...selectedProducts];

                          updated[index].quantity = text.replace(/[^0-9]/g, "");

                          setSelectedProducts(updated);
                        }}
                      />

                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => {
                          const updated = [...selectedProducts];

                          const currentQty = Number(
                            updated[index].quantity || 0,
                          );

                          updated[index].quantity = String(currentQty + 1);

                          setSelectedProducts(updated);
                        }}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* TOTAL */}

            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total</Text>

              <Text style={styles.totalAmount}>Rs. {totalAmount}</Text>
            </View>

            {/* UPDATE BUTTON */}

            <TouchableOpacity
              style={styles.button}
              onPress={updateOrder}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={productModalVisible} animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
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
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item._id}
              contentContainerStyle={{
                paddingBottom: 120,
              }}
              renderItem={({ item }) => {
                const qty = getProductQuantity(item._id);

                return (
                  <View style={styles.productCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{item.productName}</Text>

                      <Text>Rs. {item.rate}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => changeProductQuantity(item, -1)}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>

                      <TextInput
                        value={String(qty)}
                        keyboardType="numeric"
                        style={styles.qtyInput}
                        onChangeText={(text) => {
                          const numericValue = text.replace(/[^0-9]/g, "");

                          setSelectedProducts((prev) => {
                            const updated = [...prev];

                            const existingIndex = updated.findIndex(
                              (p) => p.product === item._id,
                            );

                            if (existingIndex === -1) {
                              if (!numericValue || Number(numericValue) <= 0) {
                                return prev;
                              }

                              return [
                                ...prev,
                                {
                                  product: item._id,
                                  productName: item.productName,
                                  quantity: numericValue,
                                  rate: item.rate,
                                  uom: item.uom || "",
                                },
                              ];
                            }

                            if (
                              numericValue === "" ||
                              Number(numericValue) === 0
                            ) {
                              updated.splice(existingIndex, 1);

                              return updated;
                            }

                            updated[existingIndex].quantity = numericValue;

                            return updated;
                          });
                        }}
                      />

                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => changeProductQuantity(item, 1)}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />

            <View style={styles.footerSummary}>
              <Text style={styles.footerSummaryText}>Items: {totalItems}</Text>

              <Text style={styles.footerSummaryAmount}>Rs. {totalAmount}</Text>
            </View>

            {/* CLOSE */}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setProductModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 16,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 16,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },

  productCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  addText: {
    color: "#007bff",
    fontWeight: "bold",
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
    width: 60,
    height: 45,

    borderWidth: 1,
    borderColor: "#ccc",

    borderRadius: 8,

    textAlign: "center",
  },

  removeButton: {
    width: 40,
    height: 40,

    borderRadius: 8,

    backgroundColor: "red",

    justifyContent: "center",

    alignItems: "center",
  },

  removeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginTop: 20,
    marginBottom: 20,
  },

  totalText: {
    fontSize: 22,
    fontWeight: "bold",
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
  },

  button: {
    backgroundColor: "#007bff",

    height: 52,

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  addProductButton: {
    backgroundColor: "#007bff",
    height: 50,
    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  closeButton: {
    backgroundColor: "#6c757d",

    height: 50,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 10,
  },

  inputGroup: {
    marginTop: 10,
  },

  editableInputlabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  // qtyButton: {
  //   width: 36,
  //   height: 36,
  //   borderRadius: 18,
  //   backgroundColor: "#007bff",

  //   justifyContent: "center",
  //   alignItems: "center",
  // },

  // qtyButtonText: {
  //   color: "#fff",
  //   fontSize: 20,
  //   fontWeight: "bold",
  // },

  // qtyInput: {
  //   width: 70,
  //   height: 40,

  //   borderWidth: 1,
  //   borderColor: "#ccc",

  //   borderRadius: 8,

  //   textAlign: "center",

  //   fontSize: 16,
  //   fontWeight: "bold",

  //   paddingVertical: 0,
  // },

  footerSummary: {
    borderTopWidth: 1,
    borderColor: "#ddd",

    paddingVertical: 15,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerSummaryText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  footerSummaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },

  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007bff",

    justifyContent: "center",
    alignItems: "center",
  },

  qtyButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  qtyInput: {
    width: 70,
    height: 40,

    borderWidth: 1,
    borderColor: "#ccc",

    borderRadius: 8,

    textAlign: "center",

    fontWeight: "bold",
  },
});
