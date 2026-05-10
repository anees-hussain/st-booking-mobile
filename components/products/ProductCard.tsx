// components/products/ProductCard.tsx

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateRate: () => void;
  onToggleStatus: () => void;
}



export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onUpdateRate,
  onToggleStatus,
}: Props) {

  
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{product.productName}</Text>

      <Text>Unit: {product.uom}</Text>

      <Text>Sale Rate: Rs. {product.rate}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            {
              backgroundColor: product.isActive ? "#dc3545" : "#28a745",
            },
          ]}
          onPress={onToggleStatus}
        >
          <Text style={styles.buttonText}>
            {product.isActive ? "Disable" : "Activate"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },

  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  editButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  rateButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  deleteButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
