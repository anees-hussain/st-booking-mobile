import React, { useEffect, useState } from "react";

import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const storedUser = await AsyncStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");

    await AsyncStorage.removeItem("user");

    router.replace("/");
  };

  const renderModules = () => {
    if (!user) return null;

    switch (user.designation) {
      case "controller":
        return (
          <>
            <MenuButton title="View Orders" />
            <MenuButton
              title="Orders Summary"
              onPress={() => router.push("/orders")}
            />
            <MenuButton title="Print Orders" />
            <MenuButton
              title="User Management"
              onPress={() => router.push("/users")}
            />
          </>
        );

      case "manager":
        return (
          <>
            <MenuButton
              title="Orders Summary"
              onPress={() => router.push("/orders/index")}
            />
            <MenuButton title="Print Orders" />
            <MenuButton title="Orders By Customer" />
            <MenuButton title="Update Orders" />
          </>
        );

      case "seller":
        return (
          <>
            <MenuButton title="Update Orders" />
            <MenuButton title="Summary By Product" />
            <MenuButton title="Summary By Customer" />
          </>
        );

      case "producer":
        return (
          <>
            <MenuButton title="Summary By Product" />
            <MenuButton
              title="Orders Summary"
              onPress={() => router.push("/orders/index")}
            />
            <MenuButton title="Submitted Orders" />
            <MenuButton title="Delivered Orders" />
            <MenuButton title="Cancelled Orders" />
          </>
        );

      default:
        return <Text>No permissions assigned</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Welcome {user?.fullName}</Text>

      <Text style={styles.designation}>{user?.designation}</Text>

      {renderModules()}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuButton({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
  },

  designation: {
    fontSize: 18,
    color: "gray",
    marginBottom: 30,
    textTransform: "capitalize",
  },

  card: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },

  cardText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  logoutButton: {
    backgroundColor: "red",
    padding: 18,
    borderRadius: 12,
    marginTop: 40,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
