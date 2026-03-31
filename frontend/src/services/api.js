import axios from "axios";

export const API = import.meta.env.VITE_API_URL;

const ensureApiRoot = (rawValue) => {
  const raw = String(rawValue || "").trim();
  if (!raw) {
    return "";
  }

  if (!/^https?:\/\//i.test(raw)) {
    const normalized = raw.endsWith("/") ? raw.slice(0, -1) : raw;
    if (!normalized || normalized === "/") return "";
    return normalized.replace(/\/api$/i, "");
  }

  try {
    const parsed = new URL(raw);
    parsed.pathname = parsed.pathname.replace(/\/+$/, "").replace(/\/api$/i, "");
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return raw.endsWith("/") ? raw.slice(0, -1).replace(/\/api$/i, "") : raw.replace(/\/api$/i, "");
  }
};

const resolveApiRoot = () => {
  if (typeof window !== "undefined" && /(^|\.)vercel\.app$/i.test(window.location.hostname)) {
    return "";
  }

  return ensureApiRoot(API);
};

const readTokenFromStorage = () => {
  if (typeof window === "undefined") return "";

  const directKeyCandidates = [
    "token",
    "accessToken",
    "authToken",
    "jwt",
    "jwtToken",
    "idToken",
    "access_token",
    "auth_token",
  ];

  for (const key of directKeyCandidates) {
    const value = String(window.localStorage.getItem(key) || "").trim();
    if (value) return value;
  }

  const jsonCandidates = ["user", "auth", "session", "currentUser"];
  for (const key of jsonCandidates) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const nested =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.authToken ||
        parsed?.jwt ||
        parsed?.data?.token ||
        parsed?.data?.accessToken ||
        parsed?.user?.token ||
        parsed?.user?.accessToken;
      const token = String(nested || "").trim();
      if (token) return token;
    } catch {
      // Continue scanning other keys if one persisted blob is malformed.
    }
  }

  return "";
};

export const API_BASE_URL = resolveApiRoot();

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = readTokenFromStorage();
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const normalizeResult = (response, fallbackData = null) => {
  const payload = response?.data ?? {};
  const success = payload?.success !== false;
  const data = payload?.data ?? fallbackData;

  return {
    success,
    data,
    message: payload?.message || "",
    error: payload?.error || "",
    errors: payload?.errors,
    summary: payload?.summary,
    pagination: payload?.pagination,
  };
};

const normalizeError = (error) => {
  const payload = error?.response?.data || {};
  const status = Number(error?.response?.status || 0);
  const path = error?.config?.url || "unknown-endpoint";
  const message = payload?.message || payload?.error || error?.message || "Request failed";

  // Centralized client-side API error logging for easier production debugging.
  console.error("API request failed", {
    status,
    path,
    message,
  });

  return {
    success: false,
    data: null,
    message: payload?.message || "",
    error: message,
    errors: payload?.errors,
  };
};

const isNotFoundError = (error) => Number(error?.response?.status || 0) === 404;

const unwrapArray = (value, fallbackKeys = []) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    for (const key of fallbackKeys) {
      if (Array.isArray(value[key])) return value[key];
    }
  }
  return [];
};

export const getStores = async () => {
  try {
    const response = await api.get("/api/stores");
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: unwrapArray(normalized.data, ["stores"]),
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const addStore = async (payload) => {
  try {
    const response = await api.post("/api/stores", payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.store || normalized.data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const updateStore = async (id, payload) => {
  try {
    const response = await api.put(`/api/stores/${id}`, payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.store || normalized.data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const deleteStore = async (id) => {
  try {
    const response = await api.delete(`/api/stores/${id}`);
    return normalizeResult(response);
  } catch (error) {
    return normalizeError(error);
  }
};

export const getMachinesByStore = async (storeId) => {
  try {
    const response = await api.get(`/api/stores/${storeId}/machines`);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: unwrapArray(normalized.data, ["machines"]),
    };
  } catch (firstError) {
    try {
      const fallback = await api.get("/api/machines", { params: { storeId } });
      const normalized = normalizeResult(fallback);
      return {
        ...normalized,
        data: unwrapArray(normalized.data, ["machines"]),
      };
    } catch (error) {
      return normalizeError(error || firstError);
    }
  }
};

export const createMachine = async (payload) => {
  try {
    const response = await api.post("/api/machines", payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.machine || normalized.data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const deleteMachine = async (id) => {
  try {
    const response = await api.delete(`/api/machines/${id}`);
    return normalizeResult(response);
  } catch (error) {
    return normalizeError(error);
  }
};

export const getSpareParts = async (params = {}) => {
  try {
    const response = await api.get("/api/spares", { params });
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: unwrapArray(normalized.data, ["spareParts", "inventory"]),
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const createSparePart = async (payload) => {
  try {
    const response = await api.post("/api/spares", payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.sparePart || normalized.data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const updateSparePart = async (id, payload) => {
  try {
    const response = await api.put(`/api/spares/${id}`, payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.sparePart || normalized.data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const deleteSparePart = async (id) => {
  try {
    const response = await api.delete(`/api/spares/${id}`);
    return normalizeResult(response);
  } catch (error) {
    return normalizeError(error);
  }
};

export const getAlerts = async () => {
  try {
    const response = await api.get("/api/alerts");
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: unwrapArray(normalized.data, ["alerts"]),
    };
  } catch (firstError) {
    if (!isNotFoundError(firstError)) {
      return normalizeError(firstError);
    }

    try {
      const fallback = await api.get("/api/inventory/alerts");
      const normalized = normalizeResult(fallback);
      return {
        ...normalized,
        data: unwrapArray(normalized.data, ["alerts"]),
      };
    } catch (error) {
      return normalizeError(error || firstError);
    }
  }
};

export const getOrders = async (params = {}) => {
  try {
    const response = await api.get("/api/orders", { params });
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: unwrapArray(normalized.data, ["orders"]),
      summary: normalized.summary || normalized.data?.summary,
    };
  } catch (firstError) {
    if (!isNotFoundError(firstError)) {
      return normalizeError(firstError);
    }

    try {
      const fallback = await api.get("/api/orders-list", { params });
      const normalized = normalizeResult(fallback);
      return {
        ...normalized,
        data: unwrapArray(normalized.data, ["orders"]),
        summary: normalized.summary || normalized.data?.summary,
      };
    } catch (error) {
      return normalizeError(error || firstError);
    }
  }
};

export const createOrder = async (payload) => {
  try {
    const response = await api.post("/api/orders", payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.order || normalized.data,
    };
  } catch (firstError) {
    if (!isNotFoundError(firstError)) {
      return normalizeError(firstError);
    }

    try {
      const fallback = await api.post("/api/orders-list", payload);
      const normalized = normalizeResult(fallback);
      return {
        ...normalized,
        data: normalized.data?.order || normalized.data,
      };
    } catch (error) {
      return normalizeError(error || firstError);
    }
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await api.delete(`/api/orders/${id}`);
    return normalizeResult(response);
  } catch (firstError) {
    if (!isNotFoundError(firstError)) {
      return normalizeError(firstError);
    }

    try {
      const fallback = await api.delete(`/api/orders-list/${id}`);
      return normalizeResult(fallback);
    } catch (error) {
      return normalizeError(error || firstError);
    }
  }
};

export const getPurchaseOrders = async (params = {}) => {
  try {
    const response = await api.get("/api/purchase-orders", { params });
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: unwrapArray(normalized.data, ["purchaseOrders", "orders"]),
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const createPurchaseOrder = async (payload) => {
  try {
    const response = await api.post("/api/purchase-orders", payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.purchaseOrder || normalized.data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    const response = await api.delete(`/api/purchase-orders/${id}`);
    return normalizeResult(response);
  } catch (error) {
    return normalizeError(error);
  }
};

export const getTransfers = async (params = {}) => {
  try {
    const response = await api.get("/api/transfers", { params });
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: unwrapArray(normalized.data, ["transfers"]),
      pagination: normalized.pagination,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const getIncomingTransfers = async (params = {}) => {
  return getTransfers({ ...params, type: "incoming" });
};

export const getTransferStats = async (params = {}) => {
  try {
    const response = await api.get("/api/transfers/stats", { params });
    return normalizeResult(response);
  } catch (error) {
    return normalizeError(error);
  }
};

export const createTransfer = async (payload) => {
  try {
    const response = await api.post("/api/transfers", payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.transfer || normalized.data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const createIncomingTransfer = async (payload) => {
  const normalizedPayload = {
    ...payload,
    type: "incoming",
  };
  return createTransfer(normalizedPayload);
};

export const markTransferReceived = async (id, payload = {}) => {
  try {
    const response = await api.patch(`/api/transfers/${id}/receive`, payload);
    const normalized = normalizeResult(response);
    return {
      ...normalized,
      data: normalized.data?.transfer || normalized.data,
    };
  } catch (firstError) {
    try {
      const fallback = await api.patch(`/api/transfers/${id}/mark-received`, payload);
      const normalized = normalizeResult(fallback);
      return {
        ...normalized,
        data: normalized.data?.transfer || normalized.data,
      };
    } catch (error) {
      return normalizeError(error || firstError);
    }
  }
};

export const getStoreOrders = async (storeId) => {
  return getOrders({ storeId });
};

export const confirmStoreOrderReceive = async (id, payload = {}) => {
  try {
    const response = await api.patch(`/api/orders/${id}/confirm-receive`, payload);
    return normalizeResult(response);
  } catch (error) {
    return normalizeError(error);
  }
};

export const confirmStoreOrderDispatch = async (id, payload = {}) => {
  try {
    const response = await api.patch(`/api/orders/${id}/confirm-dispatch`, payload);
    return normalizeResult(response);
  } catch (error) {
    return normalizeError(error);
  }
};

export default api;
