import axios from "axios";
import { LocalStorageService, isBrowser } from "./LocalStorageHandler";

//Constants
const URL = process.env.SERVER;

export const axiosInstance = axios.create({
  baseURL: URL,
});

/*=========== Interceptor ================ */
axiosInstance.interceptors.request.use(
  (request) => {
    if (
      request.url.startsWith("/api-token-auth/") ||
      request.url.includes("/api-token-auth/")
    ) {
      return request;
    }
    request.headers["Authorization"] =
      "token " + LocalStorageService.get("access_token");
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  //redirecting to login page on following error codes
  function (error) {
    return Promise.reject(error);
  }
);

export const requestHandler = async (api, setLoading, onSuccess, onError) => {
  // Show loading state if setLoading function is provided
  setLoading && setLoading(true);
  try {
    // Make the API request
    const response = await api();

    if (!response?.data) {
      if (response?.status.code < 400) {
        // Call the onSuccess callback with the response data
        onSuccess(response);
      } else {
        throw response;
      }
    } else {
      const { data } = response;
      if (data?.status.code < 400) {
        // Call the onSuccess callback with the response data
        onSuccess(data);
      } else {
        throw data;
      }
    }
  } catch (error) {
    // Handle error cases, including unauthorized and forbidden cases
    if ([401, 403].includes(error?.response?.status)) {
      localStorage.clear(); // Clear local storage on authentication issues
      if (isBrowser) window.location.href = "/login"; // Redirect to login page
      onError(
        error?.response?.data?.status.description || "Something went wrong"
      );
    } else {
      onError(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
    }
  } finally {
    // Hide loading state if setLoading function is provided
    setLoading && setLoading(false);
  }
};
