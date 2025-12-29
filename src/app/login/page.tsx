"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const message = searchParams.get("message");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Signed in successfully!");
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Invalid login credentials");
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
                    <div className="w-20 h-20 flex items-center justify-center mx-auto mb-8">
                        <img src="/ventra-logo.svg" alt="Ventra Logo" className="w-full h-full" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight">Welcome back</h1>
                    <p className="text-gray-500 text-base font-medium">
                        {message === "check-email"
                            ? "Please check your email to verify your account."
                            : "Your micro-store is waiting for you."
                        }
                    </p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl rounded-[32px] p-8 sm:p-10 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="keith@tryventra.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-14 pl-12 rounded-xl bg-white/[0.03] border-white/[0.08] focus:border-sky-500/50 focus:ring-sky-500/10 transition-all text-base font-medium text-white placeholder:text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Secure Password</label>
                                <Link href="#" className="text-[10px] font-bold text-sky-500 hover:text-sky-400 tracking-tighter transition-colors">FORGOT?</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    id="password"
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
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
                        </Button>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 font-bold">
                        Don't have a store yet?{" "}
                        <Link href="/signup" className="font-black text-sky-400 hover:text-sky-300 transition-colors">
                            Launch now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans"><Loader2 className="w-10 h-10 text-sky-500 animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
