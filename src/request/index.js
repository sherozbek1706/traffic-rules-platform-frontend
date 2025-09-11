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

// ========== CLIENT REQUEST HELPERS ==========
export const clientGetRequest = async (url, config) => {
  try {
    const { data } = await clientAxiosInstance.get(url, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};

export const clientPostRequest = async (url, payload, config) => {
  try {
    const { data } = await clientAxiosInstance.post(url, payload, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};

export const clientPutRequest = async (url, payload, config) => {
  try {
    const { data } = await clientAxiosInstance.put(url, payload, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};

export const clientDeleteRequest = async (url, config) => {
  try {
    const { data } = await clientAxiosInstance.delete(url, config);
    return data;
  } catch (error) {
    Errors(error);
  }
};
