import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

interface Props {
  product: string;
  quantity: string;
  onChangeProduct: (value: string) => void;
  onChangeQuantity: (value: string) => void;
}

export default function ProductRow({
  product,
  quantity,
  onChangeProduct,
  onChangeQuantity,
}: Props) {
  return (
    <View style={styles.row}>
      <TextInput
        placeholder="Product"
        style={styles.input}
        value={product}
        onChangeText={onChangeProduct}
      />

      <TextInput
        placeholder="Qty"
        keyboardType="numeric"
        style={styles.qty}
        value={quantity}
        onChangeText={onChangeQuantity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },

  qty: {
    width: 80,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
});
