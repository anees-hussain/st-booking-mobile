// components/products/ProductFormModal.tsx

import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { createProduct, updateProduct } from "../../services/productService";

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedProduct: any;
  onSuccess: () => void;
}

export default function ProductFormModal({
  visible,
  onClose,
  selectedProduct,
  onSuccess,
}: Props) {
  const [productName, setProductName] = useState("");

  const [uom, setUom] = useState("");

  const [rate, setRate] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setProductName(selectedProduct.productName || "");

      setUom(selectedProduct.uom || "");

      setRate(String(selectedProduct.rate || ""));
    } else {
      resetForm();
    }
  }, [selectedProduct, visible]);

  const resetForm = () => {
    setProductName("");
    setUom("");
    setRate("");
  };

  const handleSubmit = async () => {
    try {
      // VALIDATION
      if (!productName.trim()) {
        return Alert.alert("Validation", "Product name is required");
      }

      if (!uom.trim()) {
        return Alert.alert("Validation", "UOM is required");
      }

      if (!rate.trim()) {
        return Alert.alert("Validation", "Rate is required");
      }

      setLoading(true);

      const payload = {
        productName,
        uom,
        rate: Number(rate),
      };

      // UPDATE PRODUCT
      if (selectedProduct?._id) {
        await updateProduct(selectedProduct._id, payload as any);

        Alert.alert("Success", "Product updated successfully");
      }

      // CREATE PRODUCT
      else {
        await createProduct(payload as any);

        Alert.alert("Success", "Product created successfully");
      }

      resetForm();

      onClose();

      onSuccess();
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <Text style={styles.heading}>
          {selectedProduct ? "Update Product" : "Add Product"}
        </Text>

        {/* PRODUCT NAME */}

        <Text style={styles.label}>Product Name</Text>

        <TextInput
          placeholder="Enter Product Name"
          value={productName}
          onChangeText={setProductName}
          style={styles.input}
        />

        {/* UOM */}

        <Text style={styles.label}>UOM</Text>

        <TextInput
          placeholder="e.g. KG, PCS, TON"
          value={uom}
          onChangeText={setUom}
          style={styles.input}
        />

        {/* RATE */}

        <Text style={styles.label}>Rate</Text>

        <TextInput
          placeholder="Enter Rate"
          value={rate}
          onChangeText={setRate}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* SAVE BUTTON */}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {selectedProduct ? "Update Product" : "Save Product"}
            </Text>
          )}
        </TouchableOpacity>

        {/* CLOSE BUTTON */}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 18,
    backgroundColor: "#fff",
  },

  saveButton: {
    backgroundColor: "#007bff",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  closeButton: {
    backgroundColor: "#6c757d",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
