"use client";

import { ShoppingBag, ExternalLink, User } from "lucide-react";

export function ToolsView() {
    return (
        <div className="space-y-6 w-full max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-black tracking-tight text-white mb-1">Tools</h2>
                <p className="text-sm text-zinc-500 font-medium opacity-80">Powerful add-ons to supercharge your sales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature Card: Direct Checkout */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-sm group hover:shadow-lg hover:shadow-purple-500/5 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-purple-900/20 flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7 text-purple-400" />
                        </div>
                        <span className="bg-purple-900/20 text-purple-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Active</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">One-Click Checkout</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed mb-8 font-medium flex-1">Allow customers to buy directly without leaving your store. Supports Apple Pay & Google Pay.</p>
                    <button className="w-full py-3.5 rounded-xl border border-white/10 text-sm font-bold text-zinc-600 cursor-not-allowed bg-black/50">Configured</button>
                </div>

                {/* Feature Card: Analytics */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-sm group hover:shadow-lg hover:shadow-purple-500/5 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-purple-900/10 flex items-center justify-center">
                            <ExternalLink className="w-7 h-7 text-purple-400/80" />
                        </div>
                        <span className="bg-white/5 text-zinc-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Coming Soon</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Analytics Pixel</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed mb-8 font-medium flex-1">Track your conversion rates and see where your customers are coming from in real-time.</p>
                    <button className="w-full py-3.5 rounded-xl bg-white/5 text-zinc-400 text-sm font-bold hover:bg-white/10 hover:text-white transition-colors">Notify Me</button>
                </div>

                {/* Feature Card: Email Capture */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-sm group hover:shadow-lg hover:shadow-purple-500/5 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-purple-900/10 flex items-center justify-center">
                            <User className="w-7 h-7 text-purple-400/80" />
                        </div>
                        <span className="bg-white/5 text-zinc-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Coming Soon</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Fan List Builder</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed mb-8 font-medium flex-1">Capture emails and build your audience directly from your storefront.</p>
                    <button className="w-full py-3.5 rounded-xl bg-white/5 text-zinc-400 text-sm font-bold hover:bg-white/10 hover:text-white transition-colors">Notify Me</button>
                </div>
            </div>
        </div>
    );
}
