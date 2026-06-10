import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Also hide once already installed
  useEffect(() => {
    const handler = () => setVisible(false);
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[9998] w-full max-w-sm shadow-xl font-Poppins">
      <div className="bg-white rounded-2xl border border-[#F97316]/20 p-4">
        <div className="flex items-start gap-3">
          <img src="/logo.png" alt="Homydays" className="w-10 h-10 rounded-xl object-cover shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">Install Homydays Schools</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Add to your home screen for quick access — works offline too.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-[#F97316] text-white rounded-lg py-1.5 text-xs font-semibold hover:bg-[#EA580C] transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setVisible(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600 border border-gray-200 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
