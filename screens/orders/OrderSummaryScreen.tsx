import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import API from "../../services/api";

import AppHeader from "../../components/common/AppHeader";

export default function OrderSummaryScreen() {
  const [statusFilter, setStatusFilter] = useState("");

  const [sellerFilter, setSellerFilter] = useState("");

  const [deliveryByFilter, setDeliveryByFilter] = useState("");

  const [summary, setSummary] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [showStartPicker, setShowStartPicker] = useState(false);

  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startDateObject, setStartDateObject] = useState(new Date());

  const [endDateObject, setEndDateObject] = useState(new Date());

  const [statuses, setStatuses] = useState<string[]>([]);

  const [sellers, setSellers] = useState<string[]>([]);

  const [deliveryPersons, setDeliveryPersons] = useState<string[]>([]);

  const [showFilters, setShowFilters] = useState(false);

  const fetchFilterOptions = async () => {
    try {
      const response = await API.get("/orders/filters/options");

      setStatuses(response.data.statuses || []);

      setSellers(response.data.sellers || []);

      setDeliveryPersons(response.data.deliveryBy || []);
    } catch (error: any) {
      console.log(
        "Filter Options Error:",
        error?.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      let url = `/orders/summary?`;

      //
      // STATUS FILTER
      //

      if (statusFilter) {
        url += `status=${encodeURIComponent(statusFilter)}&`;
      }

      //
      // SELLER FILTER
      //

      if (sellerFilter) {
        url += `seller=${encodeURIComponent(sellerFilter)}&`;
      }

      //
      // DELIVERY FILTER
      //

      if (deliveryByFilter) {
        url += `deliveryBy=${encodeURIComponent(deliveryByFilter)}&`;
      }

      //
      // START DATE
      //

      if (startDate) {
        url += `startDate=${encodeURIComponent(startDate)}&`;
      }

      //
      // END DATE
      //

      if (endDate) {
        url += `endDate=${encodeURIComponent(endDate)}&`;
      }

      //
      // REMOVE LAST &
      //

      url = url.endsWith("&") ? url.slice(0, -1) : url;

      console.log("Summary URL:", url);

      const response = await API.get(url);

      console.log("Summary Response:", response.data);

      setSummary(response.data || []);
    } catch (error: any) {
      console.log("Summary Error:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.productName}</Text>

        <Text style={styles.text}>UOM: {item.uom}</Text>

        <Text style={styles.text}>Quantity: {item.totalQuantity}</Text>

        <Text style={styles.text}>Orders: {item.totalOrders}</Text>

        <Text style={styles.amount}>Rs. {item.totalAmount}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Order Summary" />
      <TouchableOpacity
        style={styles.filterToggleButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={styles.filterToggleText}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <>
          <Text style={styles.label}>Status</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFilters}
          >
            {["", ...statuses].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,

                  statusFilter === item && styles.activeFilterButton,
                ]}
                onPress={() => setStatusFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,

                    statusFilter === item && styles.activeFilterText,
                  ]}
                >
                  {item || "All"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Seller</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFilters}
          >
            {["", ...sellers].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,

                  sellerFilter === item && styles.activeFilterButton,
                ]}
                onPress={() => setSellerFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,

                    sellerFilter === item && styles.activeFilterText,
                  ]}
                >
                  {item || "All"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Delivery By</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFilters}
          >
            {["", ...deliveryPersons].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,

                  deliveryByFilter === item && styles.activeFilterButton,
                ]}
                onPress={() => setDeliveryByFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,

                    deliveryByFilter === item && styles.activeFilterText,
                  ]}
                >
                  {item || "All"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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

                  const month = String(selected.getMonth() + 1).padStart(
                    2,
                    "0",
                  );

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

                  const month = String(selected.getMonth() + 1).padStart(
                    2,
                    "0",
                  );

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
        </>
      )}

      <Text style={styles.resultsTitle}>Product Summary</Text>

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

    marginBottom: 12,
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

    padding: 12,

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

  quickFilters: {
    flexDirection: "row",

    paddingRight: 10,

    paddingBottom: 6,

    marginBottom: 18,
  },

  filterButton: {
    borderWidth: 1,
    borderColor: "#2563eb",

    borderRadius: 20,

    paddingHorizontal: 14,
    paddingVertical: 7,

    marginRight: 8,

    height: 36,

    justifyContent: "center",
    alignItems: "center",
  },

  activeFilterButton: {
    backgroundColor: "#2563eb",
  },

  filterText: {
    color: "#2563eb",
    fontWeight: "600",
  },

  activeFilterText: {
    color: "#fff",
  },

  filterToggleButton: {
    backgroundColor: "#2563eb",

    height: 42,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 10,
    marginBottom: 14,
  },

  filterToggleText: {
    color: "#fff",
    fontWeight: "bold",
  },

  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",

    marginBottom: 14,
    marginTop: 10,
  },
});
