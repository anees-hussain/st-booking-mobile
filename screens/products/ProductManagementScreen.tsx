import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import API from "@/services/api";

import AppHeader from "../../components/common/AppHeader";
import ProductCard from "../../components/products/ProductCard";
import ProductFormModal from "../../components/products/ProductFormModal";
import { updateProduct } from "@/services/productService";

export interface Product {
  _id?: string;
  productName: string;
  uom: string;
  rate: number;
  isActive?: boolean;
}

export default function ProductManagementScreen() {
  const [products, setProducts] = useState<Product[]>([]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [rateModalVisible, setRateModalVisible] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.productName.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredProducts(filtered);
  }, [search, products]);

  // FETCH PRODUCTS

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/products");

      setProducts(response.data);

      setFilteredProducts(response.data);
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await updateProduct(product._id!, {
        ...product,
        isActive: !product.isActive,
      } as any);

      fetchProducts();
    } catch (error) {
      Alert.alert("Error", "Failed to update product status");
    }
  };

  // DELETE PRODUCT

  const handleDelete = async (id?: string) => {
    if (!id) return;

    Alert.alert("Delete Product", "Are you sure?", [
      {
        text: "Cancel",
      },

      {
        text: "Delete",

        style: "destructive",

        onPress: async () => {
          try {
            await API.delete(`/products/${id}`);

            fetchProducts();
          } catch (error) {
            Alert.alert("Error", "Failed to delete product");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Product Management" />

      {/* SEARCH */}

      <TextInput
        placeholder="Search Product"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* ADD PRODUCT BUTTON */}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedProduct(null);

          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      {/* LOADER */}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onEdit={() => {
                setSelectedProduct(item);

                setModalVisible(true);
              }}
              onDelete={() => handleDelete(item._id)}
              onUpdateRate={() => {
                setSelectedProduct(item);

                setRateModalVisible(true);
              }}
              onToggleStatus={() => handleToggleStatus(item)}
            />
          )}
        />
      )}

      {/* PRODUCT FORM MODAL */}

      <ProductFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedProduct={selectedProduct}
        onSuccess={fetchProducts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },

  addButton: {
    backgroundColor: "#007bff",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
