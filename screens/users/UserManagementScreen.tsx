import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import AppInput from "../../components/common/AppInput";

import AppHeader from "../../components/common/AppHeader";

import AppButton from "../../components/common/AppButton";

import Loader from "../../components/common/Loader";

import UserCard from "../../components/users/UserCard";

import {
  changePassword,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../services/userService";

export default function UserManagementScreen() {
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [editingUser, setEditingUser] = useState<any>(null);

  const [fullName, setFullName] = useState("");

  const [search, setSearch] = useState("");

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [designation, setDesignation] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();

      setUsers(response || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setPassword("");
    setDesignation("");
    setEditingUser(null);
  };

  const openCreateModal = () => {
    resetForm();

    setModalVisible(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);

    setFullName(user.fullName);

    setUsername(user.username);

    setDesignation(user.designation);

    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser._id, {
          fullName,
          designation,
        });

        Alert.alert("Success", "User updated successfully");
      } else {
        await createUser({
          fullName,
          username,
          password,
          designation,
        });

        Alert.alert("Success", "User created successfully");
      }

      setModalVisible(false);

      resetForm();

      fetchUsers();
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Operation failed");
    }
  };

  const handleDeleteUser = async (id: string) => {
    Alert.alert("Delete User", "Are you sure?", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(id);

            fetchUsers();
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  };

  const handleChangePassword = (id: string) => {
    setSelectedUserId(id);

    setNewPassword("");

    setPasswordModalVisible(true);
  };

  const submitPasswordChange = async () => {
    try {
      if (!newPassword) {
        return Alert.alert("Error", "Please enter password");
      }

      await changePassword(selectedUserId, newPassword);

      Alert.alert("Success", "Password changed successfully");

      setPasswordModalVisible(false);

      setNewPassword("");
    } catch (error: any) {
      console.log("PASSWORD ERROR:", error?.response?.data || error);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Password change failed",
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.designation?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <AppHeader title="User Management" />
      </View>
      <AppInput
        placeholder="Search users..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found</Text>
        }
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onDelete={() => handleDeleteUser(item._id)}
            onEdit={() => openEditModal(item)}
            onChangePassword={() => handleChangePassword(item._id)}
          />
        )}
      />

      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <AppInput
              placeholder="Enter New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <AppButton title="Update Password" onPress={submitPasswordChange} />

            <View style={{ height: 10 }} />

            <AppButton
              title="Cancel"
              onPress={() => setPasswordModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? "Update User" : "Create User"}
            </Text>

            <AppInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />

            <AppInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />

            {!editingUser && (
              <AppInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
              />
            )}

            <AppInput
              placeholder="Designation"
              value={designation}
              onChangeText={setDesignation}
            />

            <AppButton
              title={editingUser ? "Update User" : "Create User"}
              onPress={handleSubmit}
            />

            <View style={{ height: 10 }} />

            <AppButton title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.floatingButton} onPress={openCreateModal}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    textAlign: "center",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  addButton: {
    backgroundColor: "#111",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
    fontSize: 16,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  floatingButton: {
    position: "absolute",
    bottom: 40,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  floatingButtonText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: -2,
  },
});
