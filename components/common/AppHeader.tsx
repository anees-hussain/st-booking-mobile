// components/common/AppHeader.tsx

import React from "react";

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";

interface Props {
  title: string;
  showBack?: boolean;
}

export default function AppHeader({ title, showBack = true }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* BACK BUTTON */}

      {showBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptySpace} />
      )}

      {/* TITLE */}

      <Text style={styles.title}>{title}</Text>

      {/* RIGHT SPACE */}

      <View style={styles.emptySpace} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#007bff",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,

    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,

    marginTop: 18,
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  emptySpace: {
    width: 40,
  },
});
