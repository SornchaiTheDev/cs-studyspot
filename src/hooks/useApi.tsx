import axios from "axios";
import { useEffect, useRef } from "react";

export function useApi() {
  const api = useRef(axios.create());

  useEffect(() => {
    let apiURL = "";
    if (typeof window !== undefined && window.env) {
      apiURL = window.env.API_URL;
    }
    if (window.env.IS_PROXIED === "true") {
      apiURL = "/api/proxy";
    }
    api.current.defaults.baseURL = apiURL;
    api.current.defaults.withCredentials = true;
  }, []);

  return api.current;
}
