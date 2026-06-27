import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import API from "../../services/api";

import AppHeader from "../../components/common/AppHeader";

import OrderCard from "../../components/orders/OrderCard";

import OrderFiltersModal from "../../components/orders/OrderFiltersModal";

import CreateOrderModal from "../../components/orders/CreateOrderModal";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrdersListScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [orders, setOrders] = useState<any[]>([]);

  const [orderModalVisible, setOrderModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [filtersVisible, setFiltersVisible] = useState(false);

  // FILTERS

  const [selectedSeller, setSelectedSeller] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const [sellers, setSellers] = useState<any[]>([]);

  const [deliveryMen, setDeliveryMen] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState("");

  const [selectedDeliveryBy, setSelectedDeliveryBy] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [deliveryModal, setDeliveryModal] = useState(false);

  const [deliveryBy, setDeliveryBy] = useState("");

  const deliveryOptions = deliveryMen.map((item) => item.fullName);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [pendingStatus, setPendingStatus] = useState("");

  useEffect(() => {
    setPage(1);

    setOrders([]);

    fetchOrders(1, false);
  }, [
    selectedSeller,
    selectedStatus,
    selectedDeliveryBy,
    selectedDate,
    search,
  ]);

  useEffect(() => {
    setupLoggedInUser();

    fetchSellers();
    fetchDeliverymen();
  }, []);

  useEffect(() => {
    if (user?.designation === "seller") {
      setSelectedSeller(user.fullName);
    }
  }, [user]);

  const fetchSellers = async () => {
    try {
      const response = await API.get("/users/sellers");

      setSellers(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDeliverymen = async () => {
    try {
      const response = await API.get("/users/delivery-men");

      setDeliveryMen(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const setupLoggedInUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrders = async (pageNumber = 1, isLoadMore = false) => {
    try {
      //
      // PREVENT MULTIPLE API CALLS
      //

      if (loading || loadingMore || (isLoadMore && !hasMore)) {
        return;
      }

      //
      // LOADING STATES
      //

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      //
      // API REQUEST
      //

      const response = await API.get("/orders", {
        params: {
          page: pageNumber,
          limit: 20,

          seller: selectedSeller || undefined,

          status: selectedStatus || undefined,

          deliveryBy: selectedDeliveryBy || undefined,

          date: selectedDate || undefined,

          search: search || undefined,
        },
      });

      //
      // RESPONSE DATA
      //

      const newOrders = response.data?.orders || [];

      const pagination = response.data?.pagination;

      //
      // UPDATE ORDERS
      //

      setOrders((prev) => {
        if (!isLoadMore) {
          return newOrders;
        }

        //
        // REMOVE DUPLICATES
        //

        const existingIds = new Set(prev.map((item) => item._id));

        const filteredNewOrders = newOrders.filter(
          (item: any) => !existingIds.has(item._id),
        );

        return [...prev, ...filteredNewOrders];
      });

      //
      // PAGINATION
      //

      setHasMore(pagination?.hasMore || false);

      setPage(pageNumber);
    } catch (error) {
      console.log(
        "FETCH ORDERS ERROR:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);

      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchOrders();
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!loadingMore && hasMore) {
      fetchOrders(page + 1, true);
    }
  };

  const updateOrderStatus = async (
    order: any,
    status: string,
    selectedDeliveryBy = "",
  ) => {
    //
    // ACTION TEXT
    //

    const actionTextMap: Record<string, string> = {
      delivered: "deliver",
      cancelled: "cancel",
      paid: "mark as paid",
    };

    const actionText = actionTextMap[status] || "update";

    //
    // VALIDATIONS
    //

    if (status === "delivered" && !selectedDeliveryBy) {
      Alert.alert("Error", "Please select delivery person");

      return;
    }

    //
    // CONFIRM ALERT
    //

    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${actionText} this order?`,
      [
        {
          text: "No",
          style: "cancel",
        },

        {
          text: "Yes",

          onPress: async () => {
            try {
              //
              // REQUEST BODY
              //

              const body: any = {
                status,
              };

              //
              // DELIVERY PERSON
              //

              if (status === "delivered") {
                body.deliveryBy = selectedDeliveryBy;
              }

              //
              // ACKNOWLEDGE BY
              //

              if (status === "paid") {
                body.acknowledgeBy = user?.fullName || "";
              }

              //
              // API CALL
              //

              const response = await API.put(
                `/orders/${order._id}/status`,
                body,
              );

              //
              // SUCCESS MESSAGE
              //

              Alert.alert("Success", `Order successfully ${actionText}ed`);

              //
              // CLOSE MODAL
              //

              setDeliveryModal(false);

              //
              // REFRESH ORDERS
              //

              fetchOrders(1, false);
            } catch (error: any) {
              console.log("Update Order Status Error:", error);

              Alert.alert(
                "Error",
                error?.response?.data?.message || "Something went wrong",
              );
            } finally {
              //
              // RESET STATES
              //

              setDeliveryBy("");

              setSelectedOrder(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="View Orders" />

      {/* SEARCH */}

      <TextInput
        placeholder="Search Orders"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* FILTER BUTTON */}

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFiltersVisible(true)}
      >
        <Text style={styles.filterText}>Filters</Text>
      </TouchableOpacity>

      {/* LIST */}

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 16,
          paddingTop: 6,
        }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        renderItem={({ item }) => (
          <OrderCard
            user={user}
            order={item}
            onUpdate={() => router.push(`/orders/${item._id}`)}
            onDeliver={() => {
              setSelectedOrder(item);

              setPendingStatus("delivered");

              setDeliveryModal(true);
            }}
            onCancel={() => updateOrderStatus(item, "cancelled")}
            onPayment={() => updateOrderStatus(item, "paid")}
          />
        )}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              No orders found
            </Text>
          ) : null
        }
      />

      {/* FLOATING BUTTON */}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setOrderModalVisible(true)}
      >
        <Text style={styles.floatingText}>+</Text>
      </TouchableOpacity>

      {/* FILTER MODAL */}

      <OrderFiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        sellers={sellers}
        selectedSeller={selectedSeller}
        setSelectedSeller={setSelectedSeller}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDeliveryBy={selectedDeliveryBy}
        setSelectedDeliveryBy={setSelectedDeliveryBy}
      />

      <CreateOrderModal
        user={user}
        visible={orderModalVisible}
        onClose={() => setOrderModalVisible(false)}
        onSuccess={fetchOrders}
      />

      <Modal visible={deliveryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Delivery By</Text>

            {deliveryOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionButton,
                  deliveryBy === item && styles.selectedOption,
                ]}
                onPress={async () => {
                  setDeliveryBy(item);

                  await updateOrderStatus(selectedOrder, pendingStatus, item);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setDeliveryModal(false);

                setSelectedOrder(null);

                setPendingStatus("");

                setDeliveryBy("");
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 50,
  },

  filterButton: {
    backgroundColor: "#007bff",
    marginHorizontal: 16,
    marginBottom: 14,
    height: 45,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 10,
  },

  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },

  floatingButton: {
    position: "absolute",

    right: 20,
    bottom: 60,

    width: 60,
    height: 60,

    borderRadius: 30,

    backgroundColor: "#007bff",

    justifyContent: "center",
    alignItems: "center",

    elevation: 5,
  },

  floatingText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  loadMoreButton: {
    backgroundColor: "#2563eb",

    height: 50,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 10,

    marginBottom: 20,
  },

  loadMoreText: {
    color: "#fff",

    fontWeight: "bold",

    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",

    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",

    width: "85%",

    borderRadius: 14,

    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",

    marginBottom: 20,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: "#ccc",

    borderRadius: 10,

    padding: 14,

    marginBottom: 12,
  },

  selectedOption: {
    backgroundColor: "#dbeafe",

    borderColor: "#2563eb",
  },

  confirmButton: {
    backgroundColor: "#16a34a",

    height: 50,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 10,
  },

  closeButton: {
    backgroundColor: "#dc2626",

    height: 50,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
