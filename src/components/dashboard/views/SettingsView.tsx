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
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 w-full max-w-5xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">Account</h3>
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-7 h-7 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-slate-900 truncate">{user?.email}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Synced with Supabase</p>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Connection Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">WhatsApp Orders</h3>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">
                            <Phone className="w-4 h-4" />
                        </span>
                        <input
                            className="w-full bg-slate-50 border-none rounded-xl h-12 pl-12 pr-4 text-base font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900"
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
                    <p className="text-[10px] text-slate-400 font-medium mt-3">
                        Enter your number with country code (no +). This is where you'll receive orders.
                    </p>
                </div>

                {/* Store Handle Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Store Handle</h3>
                        {!isEditingSlug && (
                            <button onClick={() => setIsEditingSlug(true)} className="text-[10px] font-bold text-slate-900 hover:text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full transition-colors">Change</button>
                        )}
                    </div>

                    {isEditingSlug || !store?.slug ? (
                        <div className="space-y-3">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                <input
                                    className={`w-full bg-slate-50 border-none rounded-xl h-12 pl-8 pr-4 text-base font-bold focus:ring-2 transition-all text-slate-900 ${isSlugAvailable === false ? 'ring-2 ring-red-500/20 text-red-600' : 'focus:ring-sky-500/20'}`}
                                    placeholder="handle"
                                    value={newSlug}
                                    onChange={(e) => handleSlugCheck(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                />
                                {isCheckingSlug ? (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                                ) : (
                                    isSlugAvailable !== null ? (
                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase ${isSlugAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {isSlugAvailable ? 'Available' : 'Taken'}
                                        </span>
                                    ) : (
                                        newSlug.length >= 3 && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-slate-400">
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
                                    className="flex-1 h-12 rounded-xl bg-black text-white font-bold text-sm shadow-xl shadow-black/10 hover:bg-slate-800 active:scale-95 transition-all"
                                >
                                    Save Handle
                                </Button>
                                <Button
                                    onClick={() => { setIsEditingSlug(false); setNewSlug(store?.slug || ""); }}
                                    className="h-12 w-12 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="bg-slate-50 rounded-xl p-4 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-100"
                            onClick={() => {
                                navigator.clipboard.writeText(`tryventra.com/${store?.slug}`);
                                toast.success("Link copied!");
                            }}
                        >
                            <p className="text-xl font-black text-slate-900 flex items-center gap-0.5">
                                <span className="text-slate-400 font-medium">@</span>{store?.slug}
                            </p>
                            <Copy className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile App Card */}
            {!isPWAInstalled && deferredPrompt && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                    <div className="flex items-center gap-5 flex-1 w-full">
                        <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-8 h-8 text-sky-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Ventra for Mobile</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Install for faster access and offline support.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handlePWAInstall}
                        className="w-full md:w-auto h-12 px-8 rounded-xl bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition-all flex items-center justify-center gap-2"
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
                    className="w-full max-w-xs justify-center h-14 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-all border border-red-100 bg-white shadow-sm hover:shadow-md hover:border-red-200 mb-6"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-bold text-base">Log out</span>
                </Button>

                <p className="text-center text-xs text-slate-300 font-bold">
                    Ventra App v1.0.0
                </p>
            </div>
        </div>
    );
}
