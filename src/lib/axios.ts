import Axios from "axios";
import store from "@/store";
import { tokenActions } from "@/store/slices/auth-slice";

const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  maxBodyLength: Infinity,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use((config) => {
  console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`, config.data);
  const state = store.getState();
  const token = state.token; // adjust if your slice is named differently
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Add response interceptors for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response [${response.status}]:`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ Error [${error.response?.status}]:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
