"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Zap,
    ShieldCheck,
    Loader2,
    Lock,
    ArrowLeft,
    Info,
    Globe,
    Store
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Script from "next/script";

export default function CheckoutPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [merchant, setMerchant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [cardInstance, setCardInstance] = useState<any>(null);
    const [cardholderName, setCardholderName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    const merchantId = params.merchantId as string;
    const amount = (params.amount as string) || "0";
    const productName = searchParams.get("productName");
    const supabase = createClient();

    const numericAmount = parseFloat(amount);
    const fee = numericAmount * 0.03; // Simple 3% math fee for display
    const total = numericAmount + fee;

    useEffect(() => {
        async function getMerchantStore() {
            try {
                // Fetch Store details instead of User details
                const { data, error } = await supabase
                    .from("Store")
                    .select("name, avatarUrl")
                    .eq("userId", merchantId)
                    .single();

                if (data) setMerchant(data);
            } catch (err) {
                console.error("Fetch merchant error:", err);
            } finally {
                setLoading(false);
            }
        }
        getMerchantStore();
    }, [merchantId]);

    // Initialize Square SDK
    async function initializeSquare() {
        if (!window.Square) return;

        const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
            console.error("Square Configuration Error: NEXT_PUBLIC_SQUARE_APPLICATION_ID or NEXT_PUBLIC_SQUARE_LOCATION_ID is missing");
            return;
        }

        try {
            const payments = window.Square.payments(appId, locationId);

            const card = await payments.card({
                style: {
                    'input': {
                        'backgroundColor': 'transparent',
                        'fontFamily': 'sans-serif',
                        'fontSize': '16px',
                        'color': '#ffffff',
                    },
                    'input::placeholder': {
                        'color': '#71717a', // zinc-400
                    },
                    'input.is-focus': {
                        'color': '#ffffff',
                    },
                    'input.is-error': {
                        'color': '#ef4444',
                    },
                    '.message-text': {
                        'color': '#ffffff',
                    },
                    '.message-icon': {
                        'color': '#ffffff',
                    },
                }
            });

            await card.attach("#card-container");
            setCardInstance(card);
        } catch (e) {
            console.error("Square initialization failed", e);
        }
    }

    async function handlePayment() {
        if (!cardInstance || !customerEmail) {
            alert("Email is required to proceed.");
            return;
        }
        setPaying(true);

        try {
            const result = await cardInstance.tokenize();
            if (result.status === "OK") {
                const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sourceId: result.token,
                        amount: amount,
                        merchantId,
                        cardholderName,
                        customerEmail,
                    }),
                });

                const data = await res.json();
                if (data.success) {
                    router.push(`/pay/success?merchantId=${merchantId}&amount=${amount}&productName=${encodeURIComponent(productName || "")}`);
                } else {
                    throw new Error(data.error);
                }
            } else {
                throw new Error(result.errors[0].message);
            }
        } catch (err: any) {
            alert(`Payment failed: ${err.message}`);
        } finally {
            setPaying(false);
        }
    }

    // Helper for number formatting
    const formatCurrency = (val: number) => {
        return val.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                <p className="text-zinc-500 font-medium animate-pulse">Initializing Secure Checkout...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-purple-500/30">
            <Script
                src="https://sandbox.web.squarecdn.com/v1/square.js"
                onLoad={initializeSquare}
            />

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-[1400px] mx-auto min-h-screen flex flex-col lg:flex-row">

                {/* Left Panel: Summary */}
                <div className="flex-1 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-zinc-500 hover:text-purple-400 transition-colors group mb-12"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back to Merchant</span>
                        </button>

                        <div className="space-y-6">
                            <div className="h-14 w-14 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_25px_rgba(147,51,234,0.3)]">
                                <Zap className="h-7 w-7 text-white fill-current" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">
                                    {productName || "Custom Payment"}
                                </h1>
                                <p className="text-zinc-500 flex items-center gap-2">
                                    <Store className="h-4 w-4" />
                                    Sold by <span className="text-white font-medium">{merchant?.name || "Merchant Store"}</span>
                                </p>
                            </div>

                            <div className="pt-12 space-y-4">
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>Subtotal</span>
                                    <span>${formatCurrency(numericAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-zinc-400">
                                    <div className="flex items-center gap-1.5">
                                        <span>Regional Fee</span>
                                        <Info className="h-3 w-3" />
                                    </div>
                                    <span>${formatCurrency(fee)}</span>
                                </div>
                                <div className="h-[1px] bg-white/5 my-4" />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-medium">Total</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-purple-500 text-xl tracking-tight">$</span>
                                        <span className="text-5xl font-bold tracking-tighter">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Panel: Payment Form */}
                <div className="lg:w-[750px] p-4 lg:p-16 flex flex-col justify-center">
                    <div className="bg-zinc-900/40 p-6 lg:p-8 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl space-y-8 w-full max-w-2xl mx-auto">


                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full h-12 bg-white/5 rounded-xl border border-white/10 px-6 text-white placeholder:text-zinc-700 outline-none focus:border-purple-500/50 transition-all font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={cardholderName}
                                    onChange={(e) => setCardholderName(e.target.value)}
                                    className="w-full h-12 bg-white/5 rounded-xl border border-white/10 px-6 text-white placeholder:text-zinc-700 outline-none focus:border-purple-500/50 transition-all font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Card Information</label>
                                <div
                                    id="card-container"
                                    className="w-full bg-white/5 rounded-xl border border-white/10 p-4 min-h-[52px] transition-all focus-within:border-purple-500/50"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handlePayment}
                            disabled={paying || !cardInstance}
                            className="w-full h-14 bg-white text-black hover:bg-zinc-100 rounded-xl text-base font-bold shadow-[0_15px_30px_-10px_rgba(168,85,247,0.2)] transition-all active:scale-[0.98] mt-4"
                        >
                            {paying ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                `Pay $${formatCurrency(total)}`
                            )}
                        </Button>

                        <p className="text-center text-[10px] text-zinc-600 leading-relaxed px-4">
                            By paying, you agree to Ventra's Terms. We protect your payment info with bank-grade encryption.
                        </p>

                        <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5 mx-[-10px]">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                PCI Compliant
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                <Lock className="h-3 w-3 text-zinc-500" />
                                Encrypted
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

declare global {
    interface Window {
        Square: any;
    }
}
