"use client";

import { ShoppingBag, ExternalLink, User } from "lucide-react";

export function ToolsView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 w-full max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Tools</h2>
                <p className="text-sm text-slate-500 font-medium opacity-80">Powerful add-ons to supercharge your sales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature Card: Direct Checkout */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm group hover:shadow-lg transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7 text-sky-600" />
                        </div>
                        <span className="bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Active</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">One-Click Checkout</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium flex-1">Allow customers to buy directly without leaving your store. Supports Apple Pay & Google Pay.</p>
                    <button className="w-full py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-400 cursor-not-allowed bg-slate-50/50">Configured</button>
                </div>

                {/* Feature Card: Analytics */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm group hover:shadow-lg transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <ExternalLink className="w-7 h-7 text-indigo-600" />
                        </div>
                        <span className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Coming Soon</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Analytics Pixel</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium flex-1">Track your conversion rates and see where your customers are coming from in real-time.</p>
                    <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-400 text-sm font-bold hover:bg-slate-100 transition-colors">Notify Me</button>
                </div>

                {/* Feature Card: Email Capture */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm group hover:shadow-lg transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <User className="w-7 h-7 text-amber-600" />
                        </div>
                        <span className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Coming Soon</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Fan List Builder</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium flex-1">Capture emails and build your audience directly from your storefront.</p>
                    <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-400 text-sm font-bold hover:bg-slate-100 transition-colors">Notify Me</button>
                </div>
            </div>
        </div>
    );
}
