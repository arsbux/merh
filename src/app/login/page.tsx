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
                {/* Top Section - Page Indicators (showing we're on login) */}
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
                <div className="px-6 pb-12">
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

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-[1px] bg-white/20 flex-1"></div>
                            <span className="text-sm text-white/40">or</span>
                            <div className="h-[1px] bg-white/20 flex-1"></div>
                        </div>

                        {/* Google Auth */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-14 rounded-2xl font-medium text-base bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>

                        {/* Sign Up Link */}
                        <button
                            onClick={() => router.push('/onboarding')}
                            className="w-full h-14 text-white/70 hover:text-white font-medium text-sm transition-colors mt-2"
                        >
                            Don't have an account? <span className="font-semibold underline">Sign Up</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="pb-8 flex justify-center">
                    <div className="w-32 h-1 bg-white/40 rounded-full" />
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
