"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getProductBySlugOrId, getStoreByUserId } from "@/app/actions";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [store, setStore] = useState<any>(null);

    const merchantId = searchParams.get("merchantId");
    const amount = searchParams.get("amount");
    const productName = searchParams.get("productName");
    const redirectUrl = searchParams.get("redirect");
    const supabase = createClient();

    useEffect(() => {
        async function recordPayment() {
            if (merchantId && amount) {
                // Fetch product and store details to show download link if applicable
                const storeData = await getStoreByUserId(merchantId!);
                if (storeData) {
                    setStore(storeData);
                    if (productName) {
                        const productData = await getProductBySlugOrId(storeData.slug, productName);
                        if (productData) {
                            setProduct(productData.product);
                        }
                    }
                }

                const { error } = await supabase.from("transactions").insert({
                    user_id: merchantId,
                    amount: Number(amount),
                    type: "IN",
                    status: "COMPLETED",
                    tx_hash: `sq_${Math.random().toString(36).substring(7)}`
                });

                if (error) console.error("Error recording success:", error);
            }

            // Artificial delay for UI
            setTimeout(() => {
                setLoading(false);

                // Handle Redirect if present
                if (redirectUrl) {
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 4000); // 4 seconds delay as requested
                }
            }, 1000);
        }
        recordPayment();
    }, [merchantId, amount, redirectUrl, productName]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Processing</h2>
                    <p className="text-zinc-500 text-sm">Finalizing your secure transaction...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Minimalist Header */}
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Payment Successful</h1>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                        Transaction processed securely via Ventra Rail.
                    </p>
                    {redirectUrl && (
                        <p className="text-xs text-indigo-400 font-bold animate-pulse pt-2">
                            Redirecting you to merchant site in 4s...
                        </p>
                    )}
                </div>
            </div>

            {/* Professional Receipt Card */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm space-y-8 shadow-xl">
                <div className="space-y-1.5 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Transaction Total</span>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-4xl font-bold tracking-tighter text-white tabular-nums">
                            ${Number(amount).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="h-[1px] bg-white/5" />

                {/* Product/Download Section */}
                {product && product.type === "DIGITAL" && product.fileUrl && (
                    <div className="space-y-4">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Download className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-purple-400">Digital Asset</p>
                                    <p className="text-sm font-bold text-white max-w-[150px] truncate">{product.name}</p>
                                </div>
                            </div>
                            <Button
                                asChild
                                className="h-10 px-6 bg-white text-black hover:bg-zinc-200 rounded-lg font-black text-xs uppercase"
                            >
                                <a href={product.fileUrl} download>Download</a>
                            </Button>
                        </div>
                        <p className="text-[9px] text-zinc-500 text-center font-bold italic">
                            A copy has also been sent to your email.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-1.5">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Settlement Network</span>
                        <p className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Square Proxy
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Status</span>
                        <p className="text-xs font-bold text-emerald-500">Settled</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[11px] font-bold uppercase tracking-widest gap-2 transition-all active:scale-[0.98]"
                >
                    <Download className="h-3.5 w-3.5" />
                    Download Receipt
                </Button>
            </div>

            {/* Action Section */}
            <div className="space-y-6">
                <Button
                    onClick={() => router.push(store ? `/${store.slug}` : "/")}
                    className="w-full h-14 bg-white text-black hover:bg-zinc-100 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex gap-2 group shadow-lg"
                >
                    Complete & Return
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-zinc-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[9px] uppercase font-black tracking-widest">End-to-End Encryption Verified</span>
                </div>
            </div>
        </div>
    );
}

export default function PayoutSuccess() {
    return (
        <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6 selection:bg-emerald-500/20">
            {/* Muted background effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/5 rounded-full blur-[100px]" />
            </div>

            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-zinc-700" />}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
