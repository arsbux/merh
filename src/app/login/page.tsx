"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const message = searchParams.get("message");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check if user has a store
            const { data: store, error: storeError } = await supabase
                .from('Store')
                .select('slug')
                .eq('userId', authData.user?.id)
                .single();

            if (storeError && storeError.code !== 'PGRST116') {
                console.error("Store check error:", storeError);
            }

            toast.success("Signed in successfully!");

            if (!store) {
                // No store found, go to setup
                router.push("/setup");
            } else {
                // Store exists, go to dashboard
                router.push("/dashboard");
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Invalid login credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/videos/introVideo.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

            {/* Content Container */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Top Section - Page Indicators */}
                <div className="pt-16 px-6">
                    <div className="flex gap-2">
                        <div className="w-2 h-1 rounded-full bg-white/30" />
                        <div className="w-2 h-1 rounded-full bg-white/30" />
                        <div className="w-8 h-1 rounded-full bg-white" />
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Content */}
                <div className="px-6 pb-20">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-[28px] font-bold text-white leading-tight mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-white/60 mb-6">
                            {message === "check-email"
                                ? "Please check your email to verify your account."
                                : "Sign in to continue to your store"
                            }
                        </p>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-3 mb-6">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 px-6 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/40"
                            />
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 px-6 pr-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/40"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <Link href="#" className="text-sm font-medium text-white/60 hover:text-white/80">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-white hover:bg-gray-100 text-black rounded-full font-semibold text-base shadow-lg transition-all active:scale-[0.98] mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                            </Button>
                        </form>

                        {/* Sign Up Link */}
                        <button
                            onClick={() => router.push('/onboarding')}
                            className="w-full h-14 text-white/70 hover:text-white font-medium text-sm transition-colors mt-2"
                        >
                            Don't have an account? <span className="font-semibold underline">Sign Up</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 text-white animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
