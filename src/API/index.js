import axios from "axios";


const API = axios.create({
  // baseURL: "http://localhost:5000/api", // local server
  // baseURL: "http://13.60.35.222:5000/api", // IP server
  baseURL: "https://api.kridemy.com/api", // production server
});   


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;














