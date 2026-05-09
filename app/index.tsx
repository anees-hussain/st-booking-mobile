import React, { useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import HomeScreen from "../screens/HomeScreen";

export default function App() {
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    }
  };

  return <HomeScreen />;
}