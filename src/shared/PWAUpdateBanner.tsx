import React, { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdateBanner: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 minutes
      if (r) setInterval(() => r.update(), 60 * 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] font-Poppins">
      <div className="bg-[#05878F] text-white rounded-xl shadow-xl px-5 py-3 flex items-center gap-4">
        <span className="text-sm font-medium">A new version is available!</span>
        <div className="flex gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-white text-[#05878F] rounded-lg px-3 py-1 text-xs font-semibold hover:bg-gray-100 transition-colors"
          >
            Update now
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-white/70 hover:text-white text-xs"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateBanner;
