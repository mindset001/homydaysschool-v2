import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens, clearRole, clearUser } from "../utils/authTokens";

const WARNING_BEFORE_MS = 5 * 60 * 1000; // Warn 5 minutes before expiry
const TICK_INTERVAL_MS = 1000;

const baseURL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_REACT_APP_API_KEY || "";

function getTokenExpiry(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return null;
    return payload.exp * 1000; // convert to ms
  } catch {
    return null;
  }
}

const SessionExpiryWarning: React.FC = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logout = useCallback(() => {
    clearTokens();
    clearRole();
    clearUser();
    navigate("/login", { replace: true });
  }, [navigate]);

  const [refreshing, setRefreshing] = useState(false);

  const stayLoggedIn = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      logout();
      return;
    }
    setRefreshing(true);
    try {
      const response = await axios.post(
        `${baseURL}/refresh`,
        { token: refreshToken },
        { headers: { "Content-Type": "application/json", "X-API-Key": API_KEY } }
      );
      const { accessToken } = response.data;
      saveTokens(accessToken, refreshToken);
      setVisible(false);
      setSecondsLeft(null);
    } catch {
      logout();
    } finally {
      setRefreshing(false);
    }
  }, [logout]);

  const dismiss = () => {
    setVisible(false);
  };

  useEffect(() => {
    const check = () => {
      const expiry = getTokenExpiry();
      if (!expiry) return;

      const now = Date.now();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setVisible(false);
        logout();
        return;
      }

      if (remaining <= WARNING_BEFORE_MS) {
        setSecondsLeft(Math.floor(remaining / 1000));
        setVisible(true);
      } else {
        setVisible(false);
        setSecondsLeft(null);
      }
    };

    check();
    intervalRef.current = setInterval(check, TICK_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [logout]);

  if (!visible || secondsLeft === null) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay =
    minutes > 0
      ? `${minutes}m ${String(seconds).padStart(2, "0")}s`
      : `${seconds}s`;

  const urgency = secondsLeft <= 60;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-full max-w-sm shadow-xl">
      <div
        className={`rounded-xl p-4 border text-sm font-Poppins ${
          urgency
            ? "bg-red-50 border-red-300 text-red-800"
            : "bg-amber-50 border-amber-300 text-amber-800"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{urgency ? "⚠️" : "🕐"}</span>
          <div className="flex-1">
            <p className="font-bold mb-1">
              {urgency ? "Session expiring!" : "Session expiring soon"}
            </p>
            <p className="text-xs mb-3">
              Your session will expire in{" "}
              <span className={`font-bold ${urgency ? "text-red-700" : "text-amber-700"}`}>
                {timeDisplay}
              </span>
              . Save your work and refresh the page to stay logged in.
            </p>
            <div className="flex gap-2">
              <button
                onClick={stayLoggedIn}
                disabled={refreshing}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
                  urgency
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                {refreshing ? "Refreshing…" : "Stay Logged In"}
              </button>
              <button
                onClick={logout}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Logout Now
              </button>
              {!urgency && (
                <button
                  onClick={dismiss}
                  className="px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600"
                  title="Dismiss"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryWarning;
