import axios from "axios";


const API = axios.create({
  // baseURL: "http://16.171.146.122:5000/api", // local server
  // baseURL: "http://localhost:5000/api", // IP server
  // baseURL: "http://51.21.194.3:5000/api", // IP server for live
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














