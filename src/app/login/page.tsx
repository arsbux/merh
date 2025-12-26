"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2, Mail, Lock } from "lucide-react";
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#020617] text-white selection:bg-sky-500 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <div className="w-full max-w-[400px] relative z-10 flex flex-col items-center mx-auto text-center">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 mb-10 group transition-all hover:scale-105 active:scale-95">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-400 to-indigo-600 rounded flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
                        <Store className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                </Link>

                {/* Header Section */}
                <div className="mb-10 space-y-2 px-4">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">Welcome back</h1>
                    <p className="text-gray-400 text-base sm:text-lg font-medium italic">
                        {message === "check-email"
                            ? "Please check your email to verify your account."
                            : "Your micro-store is waiting for you."
                        }
                    </p>
                </div>

                <form onSubmit={handleLogin} className="w-full space-y-4 px-4 sm:px-0 text-left">
                    {/* Email Field */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Mail className="w-4 h-4 sm:w-5 h-5" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12 sm:h-14 pl-11 sm:pl-12 rounded bg-white/5 border-white/10 focus:border-sky-500 focus:ring-sky-500 transition-all text-base sm:text-lg font-medium text-white placeholder:text-gray-700"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Lock className="w-4 h-4 sm:w-5 h-5" />
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12 sm:h-14 pl-11 sm:pl-12 rounded bg-white/5 border-white/10 focus:border-sky-500 focus:ring-sky-500 transition-all text-base sm:text-lg font-medium text-white placeholder:text-gray-700"
                        />
                        <Link href="#" className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-gray-500 font-bold hover:text-white transition-colors">
                            Forgot?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 sm:h-14 bg-sky-500 text-white hover:bg-sky-400 rounded font-black text-lg sm:text-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : "Sign In"}
                    </Button>
                </form>

                {/* Footer Section */}
                <div className="mt-10 space-y-4 px-4">
                    <p className="text-sm sm:text-base text-gray-400 font-medium">
                        Don't have a store?{" "}
                        <Link href="/signup" className="font-black text-sky-400 hover:text-sky-300 transition-colors">
                            Launch one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50/50"><Loader2 className="animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
