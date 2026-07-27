import Cookies from "js-cookie";
import { IProfile, UserInterface } from "../types/user.type";

const devEnvironment = import.meta.env.VITE_REACT_APP_ENV || "development";
const REMEMBER_KEY = "remember_me";

// Must be set (via the login form's "Remember me" checkbox) before saveTokens/
// setRole/setuser are called, so they know whether to persist across browser
// restarts (localStorage / persistent cookie) or just for the current session
// (sessionStorage / session cookie).
export const setRememberMe = (remember: boolean) => {
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, "1");
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
};

export const getRememberMe = (): boolean => {
  return localStorage.getItem(REMEMBER_KEY) === "1";
};

export const saveTokens = (accessToken?: string, refreshToken?: string) => {
  const remember = getRememberMe();
  const baseOptions = {
    secure: devEnvironment === "development" ? false : true, // Use this in production for HTTPS
    sameSite: "Strict" as const, // Helps prevent CSRF attacks
  };

  accessToken &&
    Cookies.set("access_token", accessToken, {
      ...baseOptions,
      // Persistent for 1 day when remembered, otherwise a session cookie
      // (cleared when the browser closes).
      ...(remember ? { expires: 1 } : {}),
    });

  refreshToken &&
    Cookies.set("refresh_token", refreshToken, {
      ...baseOptions,
      // Persistent for 7 days (matches the backend's refresh token lifetime)
      // when remembered, otherwise a session cookie.
      ...(remember ? { expires: 7 } : {}),
    });
};

export const setRole = (role: string) => {
  if (getRememberMe()) {
    localStorage.setItem("role", role);
    sessionStorage.removeItem("role");
  } else {
    sessionStorage.setItem("role", role);
    localStorage.removeItem("role");
  }
};
export const setuser = (user: IProfile) => {
  if (getRememberMe()) {
    localStorage.setItem("user", JSON.stringify(user));
    sessionStorage.removeItem("user");
  } else {
    sessionStorage.setItem("user", JSON.stringify(user));
    localStorage.removeItem("user");
  }
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get("access_token");
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get("refresh_token");
};

export const getRole = (): string | undefined => {
  return (localStorage.getItem("role") || sessionStorage.getItem("role")) as
    | string
    | undefined;
};

export const getUser = (): UserInterface => {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  return JSON.parse(raw as string);
};

export const clearTokens = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

// Clearing of role
export const clearRole = () => {
  sessionStorage.removeItem("role");
  localStorage.removeItem("role");
};
export const clearUser = () => {
  sessionStorage.removeItem("user");
  localStorage.removeItem("user");
  localStorage.removeItem(REMEMBER_KEY);
};
