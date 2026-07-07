import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import API from "@/services/api";
import * as Print from "expo-print";

export default function OrderSheetScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedSeller, setSelectedSeller] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);

  const [endDate, setEndDate] = useState(today);

  //
  // FETCH ORDERS
  //

  const getOrders = async () => {
    try {
      setLoading(true);

      let url = `/orders/ordersheet?startDate=${startDate}&endDate=${endDate}`;

      if (selectedSeller) {
        url += `&seller=${encodeURIComponent(selectedSeller)}`;
      }

      const response = await API.get(url);

      setOrders(response.data?.orders || []);
    } catch (error) {
      console.log("ORDER SHEET ERROR", error);

      Alert.alert("Error", "Could not fetch orders");
    } finally {
      setLoading(false);
    }
  };

  //
  // INITIAL LOAD
  //

  useEffect(() => {
    getOrders();
  }, []);

  //
  // SELLERS
  //

  const sellers = useMemo(() => {
    const sellerSet = new Set<string>();

    orders.forEach((order) => {
      if (order.seller) {
        sellerSet.add(order.seller);
      }
    });

    return Array.from(sellerSet);
  }, [orders]);

  //
  // PRODUCTS STRING
  //

  const getProducts = (detail: any[]) => {
    return detail
      ?.map((item: any) => `• ${item.productName} (${item.quantity})`)
      .join("\n");
  };

  const getProductsHTML = (detail: any[]) => {
    return detail
      ?.map((item: any) => `• ${item.productName} (${item.quantity})`)
      .join("<br />");
  };

  const productSummary = useMemo(() => {
    const summary: Record<
      string,
      {
        name: string;
        quantity: number;
        uom: string;
      }
    > = {};

    orders.forEach((order) => {
      (order.detail || []).forEach((item: any) => {
        const key = item.productId || item.productName;

        if (!summary[key]) {
          summary[key] = {
            name: item.productName,
            quantity: 0,
            uom: item.uom || "",
          };
        }

        summary[key].quantity += Number(item.quantity || 0);
      });
    });

    return Object.values(summary);
  }, [orders]);

  //
  // GENERATE HTML
  //

  const generateHTML = () => {
    const rows = orders
      .map(
        (order, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${order.customerName || ""}</td>
          <td>${order.address || ""}</td>
          <td>${order.phone || ""}</td>
          <td>${getProductsHTML(order.detail)}</td>
          <td>Rs. ${order.totalAmount || 0}</td>
        </tr>
      `,
      )
      .join("");

    const summaryHtml = productSummary
      .map(
        (product) =>
          `• ${product.name} (${product.quantity}${
            product.uom ? " " + product.uom : ""
          })`,
      )
      .join("<br>");

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            body {
              font-family: Arial, sans-serif;
              color: #000;
              padding: 0;
              margin: 0;
            }

            h1 {
              text-align: center;
              margin-bottom: 4px;
            }

            .meta {
              text-align: center;
              margin-bottom: 16px;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            th, td {
              border: 1px solid #000;
              padding: 6px;
              font-size: 11px;
              vertical-align: top;
              word-wrap: break-word;
            }

            th {
              background-color: #f2f2f2;
            }

            .serial {
              width: 5%;
            }

            .customer {
              width: 16%;
            }

            .phone {
              width: 12%;
            }

            .address {
              width: 24%;
            }

            .products {
              width: 30%;
            }

            .amount {
              width: 13%;
            }

            .footer {
              margin-top: 12px;
              font-size: 12px;
              text-align: right;
              font-weight: bold;
            }
          </style>
        </head>

        <body>

          <h1>SHOAIB TRADERS</h1>

          <div class="meta">
            Delivery Order Sheet
            <br />
            Total Orders: ${orders.length}
          </div>

          <table>
            <thead>
              <tr>
                <th class="serial">#</th>
                <th class="customer">Customer</th>
                <th class="address">Address</th>
                <th class="phone">Phone</th>
                <th class="products">Products</th>
                <th class="amount">Total</th>
              </tr>
            </thead>

          <tbody>
            ${rows}

            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>

              <td>
                <strong>Product Summary</strong><br><br>
                ${summaryHtml}
              </td>

              <td>
                <strong>Total Orders</strong><br>
                ${orders.length}
              </td>
            </tr>
          </tbody>
        </table>
        </body>
      </html>
    `;
  };

  //
  // PRINT
  //

  const printSheet = async () => {
    try {
      const html = generateHTML();

      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Could not print order sheet");
    }
  };

  //
  // LOADING
  //

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  //
  // UI
  //

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Order Sheet</Text>

        {/* SELLER FILTER */}

        <View style={styles.filterContainer}>
          <Text style={styles.label}>Select Seller</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSeller}
              onValueChange={(value) => setSelectedSeller(value)}
            >
              <Picker.Item label="All Sellers" value="" />

              {sellers.map((seller) => (
                <Picker.Item key={seller} label={seller} value={seller} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.label}>Start Date</Text>

          <TextInput
            style={styles.dateInput}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.label}>End Date</Text>

          <TextInput
            style={styles.dateInput}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={getOrders}>
          <Text style={styles.printButtonText}>Apply Filters</Text>
        </TouchableOpacity>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Submitted Orders: {orders.length}
          </Text>
        </View>

        {/* PRINT BUTTON */}

        <TouchableOpacity style={styles.printButton} onPress={printSheet}>
          <Text style={styles.printButtonText}>Print Order Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* PREVIEW */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {orders.map((order, index) => (
          <View key={order._id || index} style={styles.orderCard}>
            <Text style={styles.customerName}>
              {index + 1}. {order.customerName}
            </Text>

            <Text style={styles.info}>📞 {order.phone}</Text>

            <Text style={styles.info}>📍 {order.address}</Text>

            <Text style={styles.products}>{getProducts(order.detail)}</Text>

            <Text style={styles.amount}>Rs. {order.totalAmount || 0}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingTop: 14,
    paddingLeft: 14,
    paddingRight: 14,
    paddingBottom: 0,
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
    textAlign: "center",
    marginTop: 20,
  },

  filterContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  summaryCard: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    marginBottom: 9,
  },

  summaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  orderCard: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  info: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
  },

  products: {
    fontSize: 13,
    color: "#111827",
    marginTop: 8,
    marginBottom: 8,
  },

  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  printButton: {
    backgroundColor: "#111827",
    paddingVertical: 13,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  printButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  dateInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  filterButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
});
