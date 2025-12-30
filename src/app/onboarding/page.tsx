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
                            className="mb-8"
                        >
                            <h1 className="text-[32px] font-bold text-white leading-tight mb-4">
                                {slides[currentSlide].title}
                            </h1>
                            {slides[currentSlide].subtitle && (
                                <p className="text-base text-white/70 leading-relaxed">
                                    {slides[currentSlide].subtitle}
                                </p>
                            )}

                            <Button
                                onClick={handleNext}
                                className="w-full h-14 bg-white hover:bg-gray-100 text-black rounded-2xl font-semibold text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
                            >
                                {currentSlide === 0 ? "Next" : "Get Started"}
                                {currentSlide === 1 && <ChevronRight className="w-5 h-5" />}
                            </Button>
                        </div>
                    ) : (
                        /* Signup Screen */
                        <div className="">
                            <h1 className="text-[28px] font-bold text-white leading-tight mb-2">
                                Create Your Account
                            </h1>
                            <p className="text-sm text-white/60 mb-6">
                                Start selling in under 60 seconds
                            </p>

                            {/* Signup Form */}
                            <div className="space-y-3 mb-6">
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

                            {/* Signup Button */}
                            <Button
                                onClick={handleSignup}
                                disabled={loading}
                                className="w-full h-14 bg-white hover:bg-gray-100 text-black rounded-2xl font-semibold text-base shadow-lg transition-all active:scale-[0.98]"
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
