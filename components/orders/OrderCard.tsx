import React from "react";

import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

interface Props {
  order: any;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.id}>#{order.orderId}</Text>

      <Text>{order.customerName}</Text>

      <Text>Status: {order.status}</Text>

      <Text>Products: {order.products?.length}</Text>

      <Text>Seller: {order.seller?.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  id: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
});
