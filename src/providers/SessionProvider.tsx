"use client";
import { User } from "@/types/auth";
import { ChildrenProps } from "@/types/global-props";
import axios, { AxiosError } from "axios";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect } from "react";

interface SessionContext {
  user: User;
  signOut: () => void;
}

const sessionContext = createContext<SessionContext | null>(null);

export const useSession = () => {
  const context = useContext(sessionContext);
  if (context === null) {
    throw new Error("useSession must use inside (auth)/ path");
  }

  return context;
};

export const SessionProvider = ({
  children,
  user,
}: ChildrenProps & { user: User }) => {
  const Provider = sessionContext.Provider;

  const signOut = () => redirect("/api/clear-session");

  const refreshToken = useCallback(async () => {
    try {
      await axios.post("/api/proxy/v1/auth/refresh-token", null, {
        withCredentials: true,
      });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          signOut();
        }
      }
    }
  }, []);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // refresh token when change page
  useEffect(() => {
    refreshToken();
  }, [pathname, searchParams, refreshToken]);

  // refetch token interval
  useEffect(() => {
    const minute = 1000 * 60;
    setInterval(refreshToken, 1 * minute);
  }, [refreshToken]);

  return <Provider value={{ user, signOut }}>{children}</Provider>;
};
