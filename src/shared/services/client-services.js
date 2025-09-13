import axios from "axios";
import { baseURL } from "../constants/index";
const ACCESS_TOKEN = localStorage.getItem("token") || "";
export const clientAxiosInstance = axios.create({
  baseURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json",
    Authorization: ACCESS_TOKEN,
  },
});
