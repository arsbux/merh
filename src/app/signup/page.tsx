"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Redirect to onboarding (which handles signup on the 3rd screen)
        const store = searchParams.get("store");
        if (store) {
            router.replace(`/onboarding?store=${store}`);
        } else {
            router.replace("/onboarding");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <SignupContent />
        </Suspense>
    );
}
