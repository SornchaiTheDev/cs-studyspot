import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.baseURL = window.env.API_URL;
  return config;
});
