"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Share2, Menu } from "lucide-react";
import { toast } from "sonner";

export function DashboardHeader({ store, activeTab, setIsEditingSlug, setActiveTab }: any) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/ventra-logo.svg" alt="Ventra Logo" className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight capitalize leading-none mb-0.5 text-white">{store?.slug || "No Handle"}</span>
                    <span className="text-[10px] font-bold text-purple-400/80 uppercase tracking-wider">Dashboard</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`font-semibold h-9 px-4 rounded-full text-xs transition-all ${!store?.slug ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'text-zinc-400 hover:bg-purple-500/10 hover:text-purple-300'}`}
                    onClick={() => {
                        if (!store?.slug) {
                            setActiveTab('settings');
                            setIsEditingSlug(true);
                            toast.error("Please set your handle first");
                        } else {
                            window.open(`/${store.slug}`, '_blank');
                        }
                    }}
                >
                    View Live <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-zinc-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-full transition-all"
                    onClick={() => {
                        if (!store?.slug) {
                            setActiveTab('settings');
                            setIsEditingSlug(true);
                            toast.error("Please set your handle first");
                            return;
                        }
                        const url = `${window.location.origin}/${store.slug}`;
                        if (navigator.share) {
                            navigator.share({
                                title: store.name || "My Store",
                                url: url
                            }).catch(() => { });
                        } else {
                            navigator.clipboard.writeText(url);
                            toast.success("Link copied to clipboard!");
                        }
                    }}
                >
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}
