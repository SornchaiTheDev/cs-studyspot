import axios from "axios";
import { useEffect, useRef } from "react";

export function useApi() {
  const api = useRef(axios.create());

  useEffect(() => {
    api.current.defaults.baseURL =
      typeof window !== undefined && window.env ? window.env.API_URL : "";
    api.current.defaults.withCredentials = true;
  }, []);

  return api.current;
}
