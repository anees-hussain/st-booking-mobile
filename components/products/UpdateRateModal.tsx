// components/products/UpdateRateModal.tsx

import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedProduct: any;
  onSuccess: () => void;
}

export default function UpdateRateModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.heading}>Update Product Rates</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Save Rates</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },

  button: {
    backgroundColor: "#28a745",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  closeButton: {
    backgroundColor: "#6c757d",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
