"use client";

import { User, Smartphone, Download, LogOut, Loader2, Copy, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SettingsView({
    user,
    store,
    profile,
    setProfile,
    setHasChanges,
    isEditingSlug,
    setIsEditingSlug,
    newSlug,
    setNewSlug,
    isSlugAvailable,
    isCheckingSlug,
    handleSlugCheck,
    handleSaveSlug,
    isPWAInstalled,
    deferredPrompt,
    handlePWAInstall,
    handleLogout
}: any) {
    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-white px-2">Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Card */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-6">Account</h3>
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                            <User className="w-7 h-7 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-white truncate">{user?.email}</p>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">Synced with Supabase</p>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Connection Card */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-6">WhatsApp Orders</h3>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">
                            <Phone className="w-4 h-4" />
                        </span>
                        <input
                            className="w-full bg-black/50 border-none rounded-xl h-12 pl-12 pr-4 text-base font-bold focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder:text-zinc-600"
                            placeholder="e.g. 256712345678"
                            value={profile.socialLinks.whatsapp || ""}
                            onChange={(e) => {
                                setProfile({
                                    ...profile,
                                    socialLinks: {
                                        ...profile.socialLinks,
                                        whatsapp: e.target.value.replace(/[^0-9]/g, '')
                                    }
                                });
                                setHasChanges(true);
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium mt-3">
                        Enter your number with country code (no +). This is where you'll receive orders.
                    </p>
                </div>

                {/* Checkout Mode Card */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-6">Order Handling</h3>
                    <div className="flex bg-black/50 p-1 rounded-xl">
                        <button
                            onClick={() => {
                                setProfile({ ...profile, checkoutMode: 'WHATSAPP' });
                                setHasChanges(true);
                            }}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${profile.checkoutMode !== 'CHECKOUT' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            WhatsApp
                        </button>
                        <button
                            onClick={() => {
                                setProfile({ ...profile, checkoutMode: 'CHECKOUT' });
                                setHasChanges(true);
                            }}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${profile.checkoutMode === 'CHECKOUT' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Checkout
                        </button>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium mt-3">
                        {profile.checkoutMode === 'CHECKOUT'
                            ? "Customers pay via card. You withdraw earnings to your bank/mobile money."
                            : "Customers message you on WhatsApp to complete the order."}
                    </p>
                </div>

                {/* Store Handle Card */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Store Handle</h3>
                        {!isEditingSlug && (
                            <button onClick={() => setIsEditingSlug(true)} className="text-[10px] font-bold text-white hover:text-zinc-300 bg-white/5 px-3 py-1.5 rounded-full transition-colors">Change</button>
                        )}
                    </div>

                    {isEditingSlug || !store?.slug ? (
                        <div className="space-y-3">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">@</span>
                                <input
                                    className={`w-full bg-black/50 border-none rounded-xl h-12 pl-8 pr-4 text-base font-bold focus:ring-2 transition-all text-white ${isSlugAvailable === false ? 'ring-2 ring-red-500/20 text-red-500' : 'focus:ring-purple-500/20'}`}
                                    placeholder="handle"
                                    value={newSlug}
                                    onChange={(e) => handleSlugCheck(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                />
                                {isCheckingSlug ? (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-zinc-500" />
                                ) : (
                                    isSlugAvailable !== null ? (
                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase ${isSlugAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {isSlugAvailable ? 'Available' : 'Taken'}
                                        </span>
                                    ) : (
                                        newSlug.length >= 3 && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-zinc-500">
                                                Checking...
                                            </span>
                                        )
                                    )
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    disabled={!isSlugAvailable || isCheckingSlug || newSlug === store?.slug}
                                    onClick={handleSaveSlug}
                                    className="flex-1 h-12 rounded-xl bg-white text-black font-bold text-sm shadow-xl shadow-white/5 hover:bg-zinc-200 active:scale-95 transition-all"
                                >
                                    Save Handle
                                </Button>
                                <Button
                                    onClick={() => { setIsEditingSlug(false); setNewSlug(store?.slug || ""); }}
                                    className="h-12 w-12 rounded-xl bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="bg-black/50 rounded-xl p-4 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all hover:bg-black/70 border border-transparent hover:border-white/5"
                            onClick={() => {
                                navigator.clipboard.writeText(`tryventra.com/${store?.slug}`);
                                toast.success("Link copied!");
                            }}
                        >
                            <p className="text-xl font-black text-white flex items-center gap-0.5">
                                <span className="text-zinc-500 font-medium">@</span>{store?.slug}
                            </p>
                            <Copy className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile App Card */}
            {!isPWAInstalled && deferredPrompt && (
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-sm flex flex-col md:flex-row items-center gap-8">
                    <div className="flex items-center gap-5 flex-1 w-full">
                        <div className="w-16 h-16 rounded-xl bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight">Ventra for Mobile</h3>
                            <p className="text-sm text-zinc-500 font-medium mt-1">Install for faster access and offline support.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handlePWAInstall}
                        className="w-full md:w-auto h-12 px-8 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:bg-purple-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Install App
                    </Button>
                </div>
            )}

            {/* Sign Out Button */}
            <div className="pt-8 flex flex-col items-center">
                <Button
                    variant="ghost"
                    className="w-full max-w-xs justify-center h-14 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-white/5 bg-zinc-900 shadow-sm hover:shadow-md hover:border-red-500/20 mb-6"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-bold text-base">Log out</span>
                </Button>

                <p className="text-center text-xs text-zinc-700 font-bold">
                    Ventra App v1.0.0
                </p>
            </div>
        </div>
    );
}
