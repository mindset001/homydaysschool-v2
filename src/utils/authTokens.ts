import Cookies from "js-cookie";
import { IProfile, UserInterface } from "../types/user.type";

const devEnvironment = import.meta.env.VITE_REACT_APP_ENV || "development";
export const saveTokens = (accessToken?: string, refreshToken?: string) => {
  accessToken &&
    Cookies.set("access_token", accessToken, {
      expires: 1, // Expires in 1 day
      secure: devEnvironment === "development" ? false : true, // Use this in production for HTTPS
      sameSite: "Strict", // Helps prevent CSRF attacks
    });

  refreshToken &&
    Cookies.set("refresh_token", refreshToken, {
      expires: 7, // Expires in 7 days
      secure: devEnvironment === "development" ? false : true, // Use this in production for HTTPS
      sameSite: "Strict", // Helps prevent CSRF attacks
    });
};

export const setRole = (role: string) => {
  sessionStorage.setItem("role", role);
};
export const setuser = (user: IProfile) => {
  sessionStorage.setItem("user", JSON.stringify(user));
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get("access_token");
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get("refresh_token");
};

export const getRole = (): string | undefined => {
  return sessionStorage.getItem("role") as string;
};

export const getUser = (): UserInterface => {
  return JSON.parse(sessionStorage.getItem("user") as string);
};

export const clearTokens = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

// Clearing of role
export const clearRole = () => {
  sessionStorage.removeItem("role");
};
export const clearUser = () => {
  sessionStorage.removeItem("user");
};
