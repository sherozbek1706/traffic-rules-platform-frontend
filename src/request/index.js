import { adminAxiosInstance } from "../shared/services/admin-services.js";
import { clientAxiosInstance } from "../shared/services/client-services.js";
import { Errors } from "../utils/error.jsx";

// ========== ADMIN REQUEST HELPERS ==========
export const adminGetRequest = async (url, config) => {
  try {
    const { data } = await adminAxiosInstance.get(url, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};

export const adminPostRequest = async (url, payload, config) => {
  try {
    const { data } = await adminAxiosInstance.post(url, payload, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};

export const adminPutRequest = async (url, payload, config) => {
  try {
    const { data } = await adminAxiosInstance.put(url, payload, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};

export const adminDeleteRequest = async (url, config) => {
  try {
    const { data } = await adminAxiosInstance.delete(url, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};

