import React from "react";

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  order: any;
  onUpdate: () => void;
}

export default function OrderCard({ order, onUpdate }: Props) {
  return (
    <View style={styles.card}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.customerName}>{order.customerName}</Text>

          <Text style={styles.orderDate}>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>

        {/* STATUS */}

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                order.status === "submitted"
                  ? "#22c55e"
                  : order.status === "delivered"
                    ? "#f59e0b"
                    : order.status === "cancelled"
                      ? "#ef4444"
                      : "#3b82f6",
            },
          ]}
        >
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      {/* BODY */}

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address</Text>

          <Text style={styles.value}>{order.address || "N/A"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone</Text>

          <Text style={styles.value}>{order.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Seller</Text>

          <Text style={styles.value}>{order.seller || "N/A"}</Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Amount</Text>

          <Text style={styles.totalAmount}>Rs. {order.totalAmount || 0}</Text>
        </View>
      </View>

      {/* BUTTON */}

      <TouchableOpacity style={styles.button} onPress={onUpdate}>
        <Text style={styles.buttonText}>Update Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",

    borderRadius: 20,

    padding: 18,

    marginBottom: 18,

    marginHorizontal: 2,

    elevation: 5,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.12,

    shadowRadius: 6,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

    marginBottom: 16,
  },

  customerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  orderDate: {
    marginTop: 4,

    color: "#6b7280",

    fontSize: 13,
  },

  infoContainer: {
    gap: 10,
  },

  infoRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingBottom: 8,

    borderBottomWidth: 1,

    borderBottomColor: "#f3f4f6",
  },

  label: {
    fontSize: 14,

    color: "#6b7280",

    fontWeight: "600",
  },

  value: {
    flex: 1,

    textAlign: "right",

    color: "#111827",

    fontWeight: "500",

    marginLeft: 10,
  },

  totalBox: {
    marginTop: 12,

    backgroundColor: "#f9fafb",

    borderRadius: 14,

    padding: 14,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  totalLabel: {
    fontSize: 15,

    fontWeight: "700",

    color: "#374151",
  },

  totalAmount: {
    fontSize: 20,

    fontWeight: "bold",

    color: "#16a34a",
  },

  button: {
    marginTop: 18,

    backgroundColor: "#2563eb",

    height: 52,

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "700",
  },

  statusBadge: {
    paddingHorizontal: 14,

    paddingVertical: 7,

    borderRadius: 999,
  },

  statusText: {
    color: "#fff",

    fontSize: 12,

    fontWeight: "700",

    textTransform: "capitalize",
  },
});
