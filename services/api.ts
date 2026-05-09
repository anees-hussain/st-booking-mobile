import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  // baseURL: "https://st-booking.onrender.com/api",
  baseURL: "http://192.168.10.6:5000/api",
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

export default API;