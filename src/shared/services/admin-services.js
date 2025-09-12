import axios from "axios";
import { baseURL } from "../constants/index";
const ACCESS_TOKEN = localStorage.getItem("admin_token") || "";
export const adminAxiosInstance = axios.create({
  baseURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json",
    Authorization: ACCESS_TOKEN,
  },
});
