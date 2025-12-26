"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWAHandler() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Check if user is on mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // Wait a few seconds before showing our custom popup to be less intrusive
            if (isMobile) {
                const timer = setTimeout(() => {
                    setShowPopup(true);
                }, 5000);
                return () => clearTimeout(timer);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Also check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPopup(false);
        }

        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        setShowPopup(false);
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    if (!showPopup) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 shadow-2xl flex items-center gap-4 relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/20 transition-all"></div>

                <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
                    <Smartphone className="text-white w-6 h-6" />
                </div>

                <div className="flex-1 pr-6">
                    <h3 className="text-white font-black text-sm tracking-tight">merh.store for Android</h3>
                    <p className="text-gray-400 text-xs font-medium">Install our app for a better experience</p>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <Button
                        size="sm"
                        onClick={handleInstallClick}
                        className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-4 h-9 rounded shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
                    >
                        Install
                    </Button>
                    <button
                        onClick={() => setShowPopup(false)}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
