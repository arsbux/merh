"use client";

import { Home, Package, Sparkles, Banknote, Settings } from "lucide-react";

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) {
    return (
        <aside className="hidden md:flex fixed top-16 left-0 bottom-0 w-20 bg-[#020617]/80 backdrop-blur-xl border-r border-white/5 z-40 flex-col items-center py-6 gap-8">
            <button
                onClick={() => setActiveTab('store')}
                className={`flex flex-col items-center justify-center gap-1.5 w-12 h-12 rounded-2xl transition-all ${activeTab === 'store'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-transparent text-zinc-600 hover:text-white hover:bg-white/5'
                    }`}
            >
                <Home className="w-5 h-5" strokeWidth={activeTab === 'store' ? 2.5 : 2} />
            </button>

            <div className="w-full h-[1px] bg-white/5 mx-auto w-10" />

            <div className="flex flex-col gap-6">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'products' ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                >
                    <Package className="w-5 h-5" strokeWidth={activeTab === 'products' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-zinc-900 border border-purple-500/20 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        Products
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('tools')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'tools' ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                >
                    <Sparkles className="w-5 h-5" strokeWidth={activeTab === 'tools' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-zinc-900 border border-purple-500/20 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        Tools
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('earnings')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'earnings' ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                >
                    <Banknote className="w-5 h-5" strokeWidth={activeTab === 'earnings' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-zinc-900 border border-purple-500/20 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        Earnings
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'settings' ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                >
                    <Settings className="w-5 h-5" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-zinc-900 border border-purple-500/20 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        Settings
                    </span>
                </button>
            </div>
        </aside>
    );
}
