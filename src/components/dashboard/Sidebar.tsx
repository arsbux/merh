"use client";

import { Home, Package, Sparkles, Banknote, Settings } from "lucide-react";

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) {
    return (
        <aside className="hidden md:flex fixed top-16 left-0 bottom-0 w-20 bg-white/80 backdrop-blur-xl border-r border-slate-100 z-40 flex-col items-center py-6 gap-8">
            <button
                onClick={() => setActiveTab('store')}
                className={`flex flex-col items-center justify-center gap-1.5 w-12 h-12 rounded-2xl transition-all ${activeTab === 'store'
                    ? 'bg-black text-white shadow-lg shadow-black/20'
                    : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
            >
                <Home className="w-5 h-5" strokeWidth={activeTab === 'store' ? 2.5 : 2} />
            </button>

            <div className="w-full h-[1px] bg-slate-100 mx-auto w-10" />

            <div className="flex flex-col gap-6">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'products' ? 'text-black bg-slate-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <Package className="w-5 h-5" strokeWidth={activeTab === 'products' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Products
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('tools')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'tools' ? 'text-black bg-slate-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <Sparkles className="w-5 h-5" strokeWidth={activeTab === 'tools' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Tools
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('earnings')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'earnings' ? 'text-black bg-slate-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <Banknote className="w-5 h-5" strokeWidth={activeTab === 'earnings' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Earnings
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'settings' ? 'text-black bg-slate-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <Settings className="w-5 h-5" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                    <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Settings
                    </span>
                </button>
            </div>
        </aside>
    );
}
