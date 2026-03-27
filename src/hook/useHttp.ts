import { useState, useCallback } from "react";
import axios from "@/lib/axios";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions<D = any> {
  url: string;
  method?: HttpMethod;
  data?: D;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export const useHttp = <T = any>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = useCallback(
    async <R = T>({ url, method = "GET", data, params, headers }: RequestOptions) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`📡 useHttp: Sending ${method} to ${url}`, data);
        const response = await axios.request<R>({
          url,
          method,
          data,
          params,
          headers,
        });
        console.log(`✅ useHttp: Success`, response.data);
        setLoading(false);
        return response.data;
      } catch (err: any) {
        console.error(`❌ useHttp: Error caught`, err);
        const message = err?.response?.data?.message || err?.message || "Something went wrong";
        console.error(`Error message: ${message}`);
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return { sendRequest, loading, error };
};
