"use client";

import { useEffect, useState } from "react";
import { Banknote, Loader2, Info, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/app/actions";

export function EarningsView({ payoutDetails, setPayoutDetails, savingPayout, onSavePayout, store }: any) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);

    // Calculate stats
    const totalVolume = transactions
        .filter(t => t.status === 'COMPLETED' && t.type === 'IN')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingBalance = transactions
        .filter(t => t.status === 'PENDING')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // For now, assume "Last Payout" is the last successful withdrawal (type OUT)
    const lastPayout = transactions
        .filter(t => t.status === 'COMPLETED' && t.type === 'OUT')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    useEffect(() => {
        if (store?.userId) {
            loadTransactions();
        }
    }, [store?.userId]);

    async function loadTransactions() {
        setLoadingStats(true);
        try {
            const res = await getTransactions(store.userId);
            if (res.success && res.transactions) {
                setTransactions(res.transactions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white mb-1">Earnings</h2>
                    <p className="text-sm text-zinc-500 font-medium">Manage your payouts and view history.</p>
                </div>
                <button onClick={loadTransactions} disabled={loadingStats} className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Card - Full Width on Mobile, 2/3 Width on Desktop */}
                <div className="lg:col-span-3 bg-[#020617] rounded-2xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
                    <div className="absolute top-0 right-0 p-48 bg-purple-500/20 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none group-hover:bg-purple-500/30 transition-all duration-1000" />
                    <div className="relative z-10">
                        <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.2em] mb-4">Total Volume</p>
                        <h3 className="text-6xl md:text-7xl font-black tracking-tighter mb-10">
                            ${totalVolume.toFixed(2)}
                        </h3>
                        <div className="flex flex-col md:flex-row gap-6 max-w-2xl">
                            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl px-5 py-4 border border-white/5 hover:bg-white/10 hover:border-purple-500/20 transition-all">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Last Payout</p>
                                <p className="font-bold text-2xl text-white/90">
                                    {lastPayout ? `$${Number(lastPayout.amount).toFixed(2)}` : '$0.00'}
                                </p>
                            </div>
                            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl px-5 py-4 border border-white/5 hover:bg-white/10 hover:border-purple-500/20 transition-all">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending</p>
                                <p className="font-bold text-2xl text-white/90">
                                    ${pendingBalance.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payout Settings Card */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-sm space-y-6 h-full flex flex-col">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-900/20 flex items-center justify-center">
                            <Banknote className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-white tracking-tight">Payout Details</h3>
                            <p className="text-sm text-zinc-400 font-medium">Configure payments.</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Provider</label>
                            <select
                                value={payoutDetails.provider}
                                onChange={(e) => setPayoutDetails({ ...payoutDetails, provider: e.target.value })}
                                className="w-full bg-black/50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-purple-500/20 transition-all text-white hover:bg-black/70 appearance-none"
                            >
                                <option>M-Pesa (Kenya)</option>
                                <option>Airtel Money</option>
                                <option>Bank Transfer (Local)</option>
                                <option>PayPal</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Account Name</label>
                            <input
                                className="w-full bg-black/50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder:text-zinc-600 hover:bg-black/70"
                                placeholder="e.g. Keith Katale"
                                value={payoutDetails.accountName}
                                onChange={(e) => setPayoutDetails({ ...payoutDetails, accountName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Account Number</label>
                            <input
                                className="w-full bg-black/50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder:text-zinc-600 hover:bg-black/70"
                                placeholder="e.g. 0712345678"
                                value={payoutDetails.accountNumber}
                                onChange={(e) => setPayoutDetails({ ...payoutDetails, accountNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={onSavePayout}
                        disabled={savingPayout}
                        className="w-full h-12 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 shadow-lg transition-all"
                    >
                        {savingPayout ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Payout Details"}
                    </Button>

                    <div className="bg-purple-900/20 border border-purple-900/40 rounded-xl p-4 flex gap-3">
                        <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-purple-200 font-medium leading-relaxed">
                            <strong>Daily Payouts:</strong> Earnings are automatically sent to this account every day at midnight.
                        </p>
                    </div>
                </div>

                {/* Recent Transactions List */}
                <div className="lg:col-span-2 bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-sm h-full flex flex-col">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-6">Recent Transactions</h3>

                    {transactions.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-black/30 rounded-2xl border border-dashed border-white/10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Clock className="w-8 h-8 text-zinc-500" />
                            </div>
                            <p className="text-lg font-bold text-white">No activity yet</p>
                            <p className="text-sm text-zinc-500 mt-2 font-medium max-w-[250px]">Your sales history will appear here once you start selling.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-black/30 rounded-xl hover:bg-black/50 transition-colors border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'IN' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {tx.type === 'IN' ? <span className="font-bold">+</span> : <span className="font-bold">-</span>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">
                                                {tx.type === 'IN' ? 'Payment Received' : 'Payout Processed'}
                                            </p>
                                            <p className="text-xs text-zinc-500 font-medium">
                                                {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-black ${tx.type === 'IN' ? 'text-emerald-400' : 'text-white'}`}>
                                        {tx.type === 'IN' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
