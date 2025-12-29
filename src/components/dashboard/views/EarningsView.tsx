"use client";

import { Banknote, Loader2, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EarningsView({ payoutDetails, setPayoutDetails, savingPayout, onSavePayout }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 w-full max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Earnings</h2>
                <p className="text-sm text-slate-500 font-medium">Manage your payouts and view history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Card - Full Width on Mobile, 2/3 Width on Desktop */}
                <div className="lg:col-span-3 bg-[#020617] rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
                    <div className="absolute top-0 right-0 p-48 bg-sky-500/10 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none group-hover:bg-sky-500/15 transition-all duration-1000" />
                    <div className="relative z-10">
                        <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-4">Total Volume</p>
                        <h3 className="text-6xl md:text-7xl font-black tracking-tighter mb-10">$0.00</h3>
                        <div className="flex flex-col md:flex-row gap-6 max-w-2xl">
                            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Last Payout</p>
                                <p className="font-bold text-2xl text-white/90">$0.00</p>
                            </div>
                            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending</p>
                                <p className="font-bold text-2xl text-white/90">$0.00</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payout Settings Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 h-full flex flex-col">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Banknote className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-slate-900 tracking-tight">Payout Details</h3>
                            <p className="text-sm text-slate-400 font-medium">Configure payments.</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Provider</label>
                            <select
                                value={payoutDetails.provider}
                                onChange={(e) => setPayoutDetails({ ...payoutDetails, provider: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 hover:bg-slate-100 appearance-none"
                            >
                                <option>M-Pesa (Kenya)</option>
                                <option>Airtel Money</option>
                                <option>Bank Transfer (Local)</option>
                                <option>PayPal</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Name</label>
                            <input
                                className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                placeholder="e.g. Keith Katale"
                                value={payoutDetails.accountName}
                                onChange={(e) => setPayoutDetails({ ...payoutDetails, accountName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Number</label>
                            <input
                                className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                placeholder="e.g. 0712345678"
                                value={payoutDetails.accountNumber}
                                onChange={(e) => setPayoutDetails({ ...payoutDetails, accountNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={onSavePayout}
                        disabled={savingPayout}
                        className="w-full h-12 rounded-xl bg-black text-white font-bold hover:bg-slate-800 shadow-lg shadow-black/10 transition-all"
                    >
                        {savingPayout ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Payout Details"}
                    </Button>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            <strong>Daily Payouts:</strong> Earnings are automatically sent to this account every day at midnight.
                        </p>
                    </div>
                </div>

                {/* Recent Transactions Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full flex flex-col">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">Recent Transactions</h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Clock className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-900">No activity yet</p>
                        <p className="text-sm text-slate-400 mt-2 font-medium max-w-[250px]">Your sales history will appear here once you start selling.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
