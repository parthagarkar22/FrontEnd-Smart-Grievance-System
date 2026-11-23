import axios from "axios";
import { API_BASE_URL } from "../config";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  console.log("----------------------------------------")
  console.log(token)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
