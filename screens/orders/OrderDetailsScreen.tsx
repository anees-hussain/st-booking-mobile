import React from "react";

import { StyleSheet, View } from "react-native";

import AppHeader from "../../components/common/AppHeader";

export default function OrderDetailsScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Order Details" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
