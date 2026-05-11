// app/orders/summary.tsx

import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import API from "../../services/api";

import AppHeader from "../../components/common/AppHeader";

export default function OrderSummaryScreen() {
  const [type, setType] = useState("product");

  const [summary, setSummary] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [showStartPicker, setShowStartPicker] = useState(false);

  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startDateObject, setStartDateObject] = useState(new Date());

  const [endDateObject, setEndDateObject] = useState(new Date());

  useEffect(() => {
    fetchSummary();
  }, [type]);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      let url = `/orders/summary?type=${type}`;

      if (startDate) {
        url += `&startDate=${startDate}`;
      }

      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      console.log("Fetching summary with URL:", url);

      const response = await API.get(url);

      console.log(response.data);

      setSummary(response.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }: any) => {
    //
    // PRODUCT SUMMARY
    //

    if (type === "product") {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>{item.productName}</Text>

          <Text style={styles.text}>UOM: {item.uom}</Text>

          <Text style={styles.text}>Quantity: {item.totalQuantity}</Text>

          <Text style={styles.text}>Orders: {item.totalOrders}</Text>

          <Text style={styles.amount}>Rs. {item.totalAmount}</Text>
        </View>
      );
    }

    //
    // SELLER SUMMARY
    //

    if (type === "seller") {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>{item.seller}</Text>

          <Text style={styles.text}>Orders: {item.totalOrders}</Text>

          <Text style={styles.amount}>Rs. {item.totalAmount}</Text>
        </View>
      );
    }

    //
    // STATUS SUMMARY
    //

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.status}</Text>

        <Text style={styles.text}>Orders: {item.totalOrders}</Text>

        <Text style={styles.amount}>Rs. {item.totalAmount}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Order Summary" />

      {/* TABS */}

      <View style={styles.tabsContainer}>
        {["product", "seller", "status"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tabButton, type === item && styles.activeTab]}
            onPress={() => setType(item)}
          >
            <Text
              style={[styles.tabText, type === item && styles.activeTabText]}
            >
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* START DATE */}

      <Text style={styles.label}>Start Date</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartPicker(true)}
      >
        <Text>{startDate || "Select Start Date"}</Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startDateObject}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShowStartPicker(false);

            if (selected) {
              setStartDateObject(selected);

             const year = selected.getFullYear();

             const month = String(selected.getMonth() + 1).padStart(2, "0");

             const day = String(selected.getDate()).padStart(2, "0");

             const formatted = `${year}-${month}-${day}`;

              setStartDate(formatted);
            }
          }}
        />
      )}

      {/* END DATE */}

      <Text style={styles.label}>End Date</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndPicker(true)}
      >
        <Text>{endDate || "Select End Date"}</Text>
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={endDateObject}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShowEndPicker(false);

            if (selected) {
              setEndDateObject(selected);

             const year = selected.getFullYear();

             const month = String(selected.getMonth() + 1).padStart(2, "0");

             const day = String(selected.getDate()).padStart(2, "0");

             const formatted = `${year}-${month}-${day}`;

              setEndDate(formatted);
            }
          }}
        />
      )}

      {/* APPLY BUTTON */}

      <TouchableOpacity style={styles.applyButton} onPress={fetchSummary}>
        <Text style={styles.applyText}>Apply Filters</Text>
      </TouchableOpacity>

      {/* LIST */}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={summary}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderCard}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No summary found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },

  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 10,
  },

  tabButton: {
    flex: 1,

    height: 45,

    borderWidth: 1,
    borderColor: "#2563eb",

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 10,

    marginRight: 8,
  },

  activeTab: {
    backgroundColor: "#2563eb",
  },

  tabText: {
    fontWeight: "600",
    color: "#2563eb",
  },

  activeTabText: {
    color: "#fff",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",

    borderRadius: 10,

    height: 50,

    justifyContent: "center",

    paddingHorizontal: 12,

    marginBottom: 18,
  },

  applyButton: {
    backgroundColor: "#2563eb",

    height: 50,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 20,
  },

  applyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",

    borderRadius: 12,

    padding: 16,

    marginBottom: 14,

    elevation: 3,

    borderWidth: 1,
    borderColor: "#eee",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",

    marginBottom: 10,
  },

  text: {
    fontSize: 15,

    marginBottom: 6,
  },

  amount: {
    fontSize: 17,
    fontWeight: "bold",

    color: "#2563eb",

    marginTop: 10,
  },

  emptyText: {
    textAlign: "center",

    marginTop: 50,

    fontSize: 16,

    color: "#777",
  },
});
