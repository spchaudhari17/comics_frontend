import axios from "axios";


const API = axios.create({
  // baseURL: "http://16.171.146.122:5000/api", // testing server IP
  // baseURL: "http://localhost:5000/api", // local IP server
  // baseURL: "http://51.21.194.3:5000/api", // live server IP
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














