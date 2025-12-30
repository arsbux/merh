"use client";

import { Home, LayoutGrid, Sparkles, Banknote, User } from "lucide-react";

export function MobileNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) {
    const navItems = [
        { id: 'store', icon: Home, label: 'Store' },
        { id: 'products', icon: LayoutGrid, label: 'Products' },
        { id: 'tools', icon: Sparkles, label: 'Tools' },
        { id: 'earnings', icon: Banknote, label: 'Earnings' },
        { id: 'settings', icon: User, label: 'Settings' }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#020617]/90 backdrop-blur-2xl border-t border-white/10 z-50 flex items-center justify-between px-6 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`relative flex items-center justify-center ${isActive
                            ? 'bg-purple-600 text-white px-5 h-12 rounded-full shadow-lg shadow-purple-500/20'
                            : 'w-10 h-10 text-zinc-600 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Icon
                                className={`${isActive ? 'w-4 h-4' : 'w-6 h-6'}`}
                                strokeWidth={isActive ? 2.5 : 1.5}
                            />
                            {isActive && (
                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </nav>
    );
}
