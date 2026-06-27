import React, { useState } from "react";

import TcpSocket from "react-native-tcp-socket";

import { PRINTER_IP, PRINTER_PORT } from "../../config/printer";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  order: any;
  onUpdate: () => void;
  onDeliver?: () => void;
  onCancel?: () => void;
  user: any;
  onPayment?: () => void;
}

export default function OrderCard({
  user,
  order,
  onUpdate,
  onDeliver,
  onCancel,
  onPayment,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const PRINTER_WIDTH = 32;

  const centerText = (text: string) => {
    const space = Math.max(0, Math.floor((PRINTER_WIDTH - text.length) / 2));

    return " ".repeat(space) + text;
  };

  const line = (char = "-") => {
    return char.repeat(PRINTER_WIDTH);
  };

  const formatText = (text: string, max = 32) => {
    if (!text) return "";

    // remove unsupported unicode chars
    const cleaned = text.replace(/[^\x20-\x7E]/g, "");

    if (cleaned.length <= max) {
      return cleaned;
    }

    return cleaned.substring(0, max - 3) + "...";
  };

  const productRow = (
    name: string,
    qty: number,
    rate: number,
    total: number,
  ) => {
    return `${name}\n` + `Qty:${qty}  Rate:${rate}  Total:${total}\n`;
  };

  const generateInvoiceText = (order: any) => {
    const products = order.detail
      ?.map((item: any) =>
        productRow(
          item.productName,
          item.quantity,
          item.rate,
          item.quantity * item.rate,
        ),
      )
      .join("\n");

    return `
${centerText("SHOAIB TRADERS")}
${centerText("Customer Invoice")}

${line("=")}

Name:
${formatText(order.customerName || "", 30)}

Phone:
${formatText(order.phone || "", 30)}

Address:
${formatText(order.address || "", 30)}

${line("-")}

Order Details:

${products}

${line("-")}

${centerText(`TOTAL: Rs. ${order.totalAmount || 0}`)}

${line("-")}

${centerText("Thank You")}
${centerText("0303-2075886")}



\x1D\x56\x41\x10
`;
  };

  const printInvoice = async () => {
    try {
      const invoice = generateInvoiceText(order);

      const client = TcpSocket.createConnection(
        {
          host: PRINTER_IP,
          port: PRINTER_PORT,
        },

        () => {
          console.log("PRINTER CONNECTED");

          client.write(invoice);

          client.destroy();

          Alert.alert("Success", "Invoice Printed");
        },
      );

      client.on("error", (error) => {
        console.log("PRINT ERROR", error);

        Alert.alert("Error", "Could not connect to printer");
      });
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Printing failed");
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => setModalVisible(true)}
      >
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

          <View style={styles.infoRow}>
            <Text style={styles.label}>Delivered By</Text>

            <Text style={styles.value}>{order.deliveryBy || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Posted By</Text>

            <Text style={styles.value}>{order.postedBy || "N/A"}</Text>
          </View>

          {order.status === "paid" && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Paid to</Text>

                <Text style={styles.value}>{order.acknowledgeBy || "N/A"}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Paid At</Text>

                <Text style={styles.value}>
                  {order.acknowledgeAt
                    ? new Date(order.acknowledgeAt).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            </>
          )}

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>

            <Text style={styles.totalAmount}>Rs. {order.totalAmount || 0}</Text>
          </View>
        </View>

        {/* BUTTON */}

        <TouchableOpacity style={styles.printButton} onPress={printInvoice}>
          <Text style={styles.buttonText}>Print</Text>
        </TouchableOpacity>

        <View style={styles.buttonView}>
          {/* CANCELLED */}

          {order.status === "cancelled" && (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled
              >
                <Text style={styles.buttonText}>Cancelled</Text>
              </TouchableOpacity>
            </>
          )}

          {/* DELIVERED */}

          {order.status === "delivered" && (
            <>
              <TouchableOpacity
                style={styles.deliverButton}
                onPress={onDeliver}
                disabled
              >
                <Text style={styles.buttonText}>Delivered</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              {user.designation === "manager" ||
              user.designation === "controller" ? (
                <TouchableOpacity style={styles.paidButton} onPress={onPayment}>
                  <Text style={styles.buttonText}>Paid</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}

          {/* SUBMITTED */}

          {order.status === "submitted" && (
            <>
              <TouchableOpacity style={styles.updateButton} onPress={onUpdate}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deliverButton}
                onPress={onDeliver}
              >
                <Text style={styles.buttonText}>Delivered</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* HEADER */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Product Details</Text>

              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            {/* PRODUCTS */}

            <ScrollView showsVerticalScrollIndicator={false}>
              {order.detail?.length > 0 ? (
                order.detail.map((item: any, index: number) => (
                  <View key={index} style={styles.productCard}>
                    <Text style={styles.productName}>
                      {item.productName || "N/A"}
                    </Text>

                    <View style={styles.productRow}>
                      <Text style={styles.productLabel}>Quantity</Text>

                      <Text style={styles.productValue}>
                        {item.quantity || 0}
                      </Text>
                    </View>

                    <View style={styles.productRow}>
                      <Text style={styles.productLabel}>Rate</Text>

                      <Text style={styles.productValue}>
                        Rs. {item.rate || 0}
                      </Text>
                    </View>

                    <View style={styles.productRow}>
                      <Text style={styles.productLabel}>UOM</Text>

                      <Text style={styles.productValue}>
                        {item.uom || "N/A"}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  No products found
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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

  buttonView: {
    flexDirection: "row",

    justifyContent: "space-between",
  },

  updateButton: {
    marginTop: 18,

    backgroundColor: "#2563eb",

    height: 52,

    width: "30%",

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",
  },

  deliverButton: {
    marginTop: 18,

    backgroundColor: "#9d10b9",

    height: 52,

    width: "30%",

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",
  },

  cancelButton: {
    marginTop: 18,

    backgroundColor: "#dc2626",

    height: 52,

    width: "30%",

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",
  },

  paidButton: {
    marginTop: 18,

    backgroundColor: "#10b981",

    height: 52,

    width: "30%",

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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  closeText: {
    color: "#ef4444",
    fontWeight: "600",
  },

  productCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  productLabel: {
    fontSize: 14,
    color: "#6b7280",
  },

  productValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  printButton: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
});
