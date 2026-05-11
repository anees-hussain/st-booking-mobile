import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
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

  const [orders, setOrders] = useState<any[]>([]);

  const [orderModalVisible, setOrderModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [filtersVisible, setFiltersVisible] = useState(false);

  // FILTERS

  const [selectedSeller, setSelectedSeller] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const [sellers, setSellers] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    // SEARCH

    if (search) {
      data = data.filter(
        (item) =>
          item.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          item.phone?.includes(search),
      );
    }

    // SELLER FILTER

    if (selectedSeller) {
      data = data.filter((item) => item.seller === selectedSeller);
    }

    // STATUS FILTER

    if (selectedStatus) {
      data = data.filter((item) => item.status === selectedStatus);
    }

    // DATE FILTER

    if (selectedDate) {
      data = data.filter((item) =>
        item.createdAt?.slice(0, 10).includes(selectedDate),
      );
    }

    return data;
  }, [orders, search, selectedSeller, selectedStatus, selectedDate]);

  useEffect(() => {

    setupLoggedInUser();

    fetchOrders();

    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await API.get("/users/sellers");

      setSellers(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const setupLoggedInUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) return;

      const parsedUser = JSON.parse(userData);

      // AUTO FILTER FOR SELLER

      if (parsedUser.designation === "seller") {
        setSelectedSeller(parsedUser.fullName);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH ORDERS

  const fetchOrders = async (pageNumber = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await API.get(`/orders?page=${pageNumber}&limit=20`);

      console.log("response", response.data);

      const newOrders = response.data || [];

      console.log("newOrders", newOrders);

      if (isLoadMore) {
        setOrders((prev) => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }
      // PAGINATION

      setHasMore(response.data?.pagination?.hasMore || false);

      setPage(pageNumber);
    } catch (error) {
      console.log(error);
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
    if (!hasMore || loadingMore) return;

    await fetchOrders(page + 1, true);
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
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 16,
          paddingTop: 6,
        }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onUpdate={() => router.push(`/orders/${item._id}`)}
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
      />

      <CreateOrderModal
        visible={orderModalVisible}
        onClose={() => setOrderModalVisible(false)}
        onSuccess={fetchOrders}
      />
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
    bottom: 30,

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
});
