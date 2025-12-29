"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { createStore } from "@/app/actions";

function OnboardingFlow() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(false);

    // Signup form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // useEffect(() => { // Removed as storeName state is removed
    //     const store = searchParams.get("store");
    //     if (store) setStoreName(store);
    // }, [searchParams]);

    const slides = [
        {
            title: "Ventra Helps anyone operate a full online business on their mobile phone",
            subtitle: "",
        },
        {
            title: "Build a global storefront in 60 seconds",
            subtitle: "Accept worldwide payments and withdraw to any option based on your location.",
        },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handleSignup = async () => {
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // data: { // Removed as storeName is no longer part of initial signup
                    //     store_name: storeName,
                    // },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                toast.success("Account created successfully!");
                // Since email confirmation is off, we can go straight to setup
                router.push("/setup");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        router.push("/login");
    };

    const handleGoogleSignIn = async () => {
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || "Something went wrong with Google sign in");
        }
    };

    const isSignupScreen = currentSlide >= slides.length;

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
                        {[...slides, { title: "signup" }].map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 rounded-full transition-all duration-500 ${index === currentSlide
                                    ? "w-8 bg-white"
                                    : index < currentSlide
                                        ? "w-2 bg-white/60"
                                        : "w-2 bg-white/30"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Content */}
                <div className="px-6 pb-20">
                    {!isSignupScreen ? (
                        /* Onboarding Slides */
                        <div
                            key={currentSlide}
                            className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            <h1 className="text-[32px] font-bold text-white leading-tight mb-4">
                                {slides[currentSlide].title}
                            </h1>
                            {slides[currentSlide].subtitle && (
                                <p className="text-base text-white/70 leading-relaxed">
                                    {slides[currentSlide].subtitle}
                                </p>
                            )}

                            <div className="flex flex-col gap-4 mt-8">
                                <Button
                                    onClick={handleNext}
                                    className="w-full h-14 bg-white hover:bg-gray-100 text-black rounded-full font-semibold text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {currentSlide === 0 ? "Next" : "Get Started"}
                                    {currentSlide === 1 && <ChevronRight className="w-5 h-5" />}
                                </Button>

                                <div className="flex items-center gap-4 px-4">
                                    <div className="h-[1px] bg-white/10 flex-1"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">or</span>
                                    <div className="h-[1px] bg-white/10 flex-1"></div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoogleSignIn}
                                    className="w-full h-14 rounded-full font-bold text-base bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-3 transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Signup Screen */
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-[28px] font-bold text-white leading-tight mb-2">
                                Create Your Account
                            </h1>
                            <p className="text-sm text-white/60 mb-6">
                                Start selling in under 60 seconds
                            </p>

                            {/* Signup Form */}
                            <div className="space-y-3 mb-6">
                                {/* Removed storeName input field */}
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/40"
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/40"
                                />
                            </div>

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
                                onClick={handleGoogleSignIn}
                                className="w-full h-14 rounded-2xl font-medium text-base bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-3 mb-4"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>

                            {/* Signup Button */}
                            <Button
                                onClick={handleSignup}
                                disabled={loading}
                                className="w-full h-14 bg-white hover:bg-gray-100 text-black rounded-full font-semibold text-base shadow-lg transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                            </Button>

                            {/* Sign In Link */}
                            <button
                                onClick={handleSignIn}
                                className="w-full h-14 text-white/70 hover:text-white font-medium text-sm transition-colors mt-2"
                            >
                                Already have an account? <span className="font-semibold underline">Sign In</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 text-white animate-spin" /></div>}>
            <OnboardingFlow />
        </Suspense>
    );
}
