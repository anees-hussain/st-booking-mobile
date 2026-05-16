import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

import AppHeader from "@/components/common/AppHeader";
import API from "../../services/api";

export default function PaidOrdersScreen() {
  //
  // STATES
  //

  const [startDate, setStartDate] = useState(new Date());

  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);

  const [showEndPicker, setShowEndPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);

  const [byProduct, setByProduct] = useState(false);

  //
  // FETCH REPORT
  //

  const fetchReport = async () => {
    try {
      setLoading(true);

      const response = await API.get("/orders/reports/paid", {
        params: {
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
          byProduct,
        },
      });

      console.log(response.data);

      setOrders(response.data);
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

  //
  // TOTAL AMOUNT
  //

  const totalAmount = orders.reduce((sum, item) => {
    if (byProduct) {
      return sum + (item.totalAmountPaid || 0);
    }

    return sum + (item.totalAmount || 0);
  }, 0);

  //
  // RENDER ITEM
  //

  const renderItem = ({ item }: any) => {
    //
    // BY PRODUCT
    //

    if (byProduct) {
      return (
        <View style={styles.card}>
          <Text style={styles.name}>{item.productName}</Text>

          <Text style={styles.label}>Quantity: {item.totalQuantity}</Text>

          <Text style={styles.amount}>Rs. {item.totalAmountPaid}</Text>
        </View>
      );
    }

    //
    // INDIVIDUAL ORDERS
    //

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.customerName || "Customer"}</Text>

        <Text style={styles.label}>
          Received By: {item.acknowledgeBy || "-"}
        </Text>

        <Text style={styles.label}>
          Received At:{" "}
          {item.acknowledgeAt
            ? dayjs(item.acknowledgeAt).format("DD MMM YYYY hh:mm A")
            : "-"}
        </Text>

        <Text style={styles.amount}>Rs. {item.totalAmount || 0}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      {/* <Text style={styles.heading}>Paid Orders Report</Text> */}
      <AppHeader title="Paid Orders Report" />

      {/* START DATE */}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartPicker(true)}
      >
        <Text style={styles.dateLabel}>Start Date</Text>

        <Text style={styles.dateValue}>
          {dayjs(startDate).format("DD MMM YYYY")}
        </Text>
      </TouchableOpacity>

      {/* END DATE */}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndPicker(true)}
      >
        <Text style={styles.dateLabel}>End Date</Text>

        <Text style={styles.dateValue}>
          {dayjs(endDate).format("DD MMM YYYY")}
        </Text>
      </TouchableOpacity>

      {/* BY PRODUCT */}

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>By Product</Text>

        <Switch value={byProduct} onValueChange={setByProduct} />
      </View>

      {/* GENERATE BUTTON */}

      <TouchableOpacity
        style={styles.button}
        onPress={fetchReport}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Generate Report"}
        </Text>
      </TouchableOpacity>

      {/* DATE PICKERS */}

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);

            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);

            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}

      {/* TOTAL */}

      {orders.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Amount: Rs. {totalAmount}</Text>

          <Text style={styles.totalCount}>Total Records: {orders.length}</Text>
        </View>
      )}

      {/* LOADER */}

      {loading && (
        <ActivityIndicator
          size="large"
          style={{
            marginTop: 20,
          }}
        />
      )}

      {/* EMPTY */}

      {!loading && orders.length === 0 && (
        <Text style={styles.emptyText}>No data found</Text>
      )}

      {/* LIST */}

      <FlatList
        data={orders}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: 10,
        }}
      />
    </View>
  );
}

//
// STYLES
//

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "green",
    marginBottom: 20,
    marginTop: 40,
    textAlign: "center",
  },

  dateButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  dateLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },

  dateValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },

  switchContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switchText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  totalContainer: {
    backgroundColor: "#d1fae5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  totalText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065f46",
  },

  totalCount: {
    marginTop: 5,
    color: "#047857",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },

  amount: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "green",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
    fontSize: 16,
  },
});
