import React, { useState } from "react";

import {
  Alert,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";
import API from "../services/api";
//loader
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    try {
      setLoading(true);

      const payload = {
        username,
        password,
      };

      const response = await API.post("/users/login", payload);

      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data));

      router.replace("/dashboard");
    } catch (error: any) {
      console.log(error?.response?.data || error);

      Alert.alert("Error", "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Internal Login</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && {
            opacity: 0.7,
          },
        ]}
        onPress={loginUser}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
