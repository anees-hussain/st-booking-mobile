import React from "react";

import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

interface Props {
  user: any;
  onDelete: () => void;
  onEdit: () => void;
  onChangePassword: () => void;
}

export default function UserCard({ user, onEdit, onDelete, onChangePassword }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{user.fullName}</Text>

      <Text>{user.username}</Text>

      <Text>{user.designation}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.passwordBtn} onPress={onChangePassword}>
          <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  passwordBtn: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },

  editBtn: {
    backgroundColor: "#0066cc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
