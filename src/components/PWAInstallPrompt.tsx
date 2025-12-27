"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Register service worker
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((err) => {
                console.error("Service worker registration failed:", err);
            });
        }

        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the customized install prompt
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // If already installed, don't show prompt
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the PWA install");
        } else {
            console.log("User dismissed the PWA install");
        }

        // Clear the deferredPrompt variable, it can only be used once
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-[#020617]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex items-center justify-between gap-4 py-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                        <Smartphone className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-sm tracking-tight">Experience Merh as an App</h3>
                        <p className="text-white/50 text-[11px] font-medium leading-tight mt-0.5">Install for faster access and offline support.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleInstall}
                        className="bg-white text-black h-11 px-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
