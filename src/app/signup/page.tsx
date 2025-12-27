"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2, User, Mail, Lock, AtSign, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { createStore } from "@/app/actions";

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [storeName, setStoreName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const store = searchParams.get("store");
        if (store) setStoreName(store);
    }, [searchParams]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();

            // 1. Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        store_name: storeName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create the store record in database
                const storeRes = await createStore(authData.user.id, email, storeName, fullName);

                if (!storeRes.success) {
                    toast.error("Account created but store generation failed: " + storeRes.error);
                } else {
                    toast.success("Welcome aboard! Please check your email to verify.");
                }

                router.push("/login?message=check-email");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] text-[#f8fafc] selection:bg-sky-500/30 relative overflow-hidden font-sans">
            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse-subtle"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Back to Home */}
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors z-20 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to home
            </Link>

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Header Section */}
                <div className="text-center mb-12 space-y-4">
                    <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8 border border-white/20">
                        <Store className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight">
                        Reserve <span className="text-sky-400">@{storeName || 'yourname'}</span>
                    </h1>
                    <p className="text-gray-500 text-base font-medium">Build your micro-store in 60 seconds.</p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl rounded-[32px] p-8 sm:p-10 shadow-2xl">
                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* URL Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Store URL</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-600 font-black text-sm">merh.store/</span>
                                <Input
                                    placeholder="yourname"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                    required
                                    className="h-14 pl-[108px] rounded-xl bg-white/[0.03] border-white/[0.08] focus:border-sky-500/50 focus:ring-sky-500/10 transition-all text-base font-black text-white placeholder:text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <User className="w-4 h-4" />
                                </div>
                                <Input
                                    placeholder="Keith Katale"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="h-14 pl-12 rounded-xl bg-white/[0.03] border-white/[0.08] focus:border-sky-500/50 focus:ring-sky-500/10 transition-all text-base font-medium text-white placeholder:text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="keith@merh.store"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-14 pl-12 rounded-xl bg-white/[0.03] border-white/[0.08] focus:border-sky-500/50 focus:ring-sky-500/10 transition-all text-base font-medium text-white placeholder:text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Secure Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 pl-12 rounded-xl bg-white/[0.03] border-white/[0.08] focus:border-sky-500/50 focus:ring-sky-500/10 transition-all text-base font-medium text-white placeholder:text-gray-800"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-white text-black hover:bg-gray-100 rounded-xl font-black text-lg shadow-2xl transition-all active:scale-[0.98] mt-6 border border-white/20"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Start Selling"}
                        </Button>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="mt-12 text-center space-y-6">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] max-w-[300px] mx-auto leading-relaxed">
                        By continuing, you agree to our <br />
                        <span className="text-sky-500 hover:text-sky-400 cursor-pointer transition-colors">Terms of Service</span> and <span className="text-sky-500 hover:text-sky-400 cursor-pointer transition-colors">Privacy Policy</span>.
                    </p>

                    <p className="text-sm text-gray-500 font-bold">
                        Already part of the network?{" "}
                        <Link href="/login" className="font-black text-sky-400 hover:text-sky-300 transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-10 h-10 text-sky-500 animate-spin" /></div>}>
            <SignupForm />
        </Suspense>
    );
}
