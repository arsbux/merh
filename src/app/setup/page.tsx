"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft, User, Building2, Check, Search, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { createStore } from "@/app/actions";

const COUNTRIES = [
    { name: "Uganda", code: "UG", flag: "🇺🇬", dialCode: "256" },
    { name: "Kenya", code: "KE", flag: "🇰🇪", dialCode: "254" },
    { name: "Tanzania", code: "TZ", flag: "🇹🇿", dialCode: "255" },
    { name: "Rwanda", code: "RW", flag: "🇷🇼", dialCode: "250" },
    { name: "Nigeria", code: "NG", flag: "🇳🇬", dialCode: "234" },
    { name: "South Africa", code: "ZA", flag: "🇿🇦", dialCode: "27" },
    { name: "United States", code: "US", flag: "🇺🇸", dialCode: "1" },
    { name: "United Kingdom", code: "GB", flag: "🇬🇧", dialCode: "44" },
    { name: "Canada", code: "CA", flag: "🇨🇦", dialCode: "1" },
    { name: "Germany", code: "DE", flag: "🇩🇪", dialCode: "49" },
];

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form state
    const [storeType, setStoreType] = useState<"individual" | "business" | null>(null);
    const [country, setCountry] = useState<typeof COUNTRIES[0] | null>(null);
    const [storeName, setStoreName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/onboarding");
            } else {
                setUser(user);

                // Check if they already have a store
                const { data: store } = await supabase
                    .from('Store')
                    .select('slug')
                    .eq('userId', user.id)
                    .single();

                if (store) {
                    router.push("/dashboard");
                }
            }
        };
        checkUser();
    }, [router]);

    const handleNext = () => {
        if (step === 1 && storeType) {
            setStep(2);
        } else if (step === 2 && country) {
            setStep(3);
        } else if (step === 3 && storeName.length >= 2) {
            setStep(4);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        if (!whatsapp) {
            toast.error("Please enter your WhatsApp number");
            return;
        }

        setLoading(true);
        try {
            // Generate slug from store name
            const generatedSlug = storeName
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // remove special chars
                .replace(/[\s_-]+/g, '-') // replace spaces/underscores/dashes with single dash
                .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes

            // Combine dial code with number
            const fullWhatsapp = country ? `${country.dialCode}${whatsapp.replace(/[^0-9]/g, '')}` : whatsapp;

            const res = await createStore(
                user.id,
                user.email,
                generatedSlug,
                storeName,
                country?.name,
                storeType || undefined,
                fullWhatsapp
            );

            if (res.success) {
                toast.success("Store created successfully!");
                router.push("/dashboard");
            } else {
                toast.error(res.error || "Failed to create store");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const filteredCountries = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white text-black font-manrope">
            {/* Content Container */}
            <div className="relative z-10 min-h-screen flex flex-col p-6 max-w-md mx-auto w-full">

                {/* Back Button */}
                <div className="pt-4 mb-8">
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Progress Indicators */}
                <div className="mb-8">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === step
                                    ? "w-10 bg-black"
                                    : i < step
                                        ? "w-4 bg-black/40"
                                        : "w-4 bg-black/10"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    {step === 1 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-3xl font-bold mb-2">Choose account type</h1>
                            <p className="text-black/50 mb-8">How will you be using Ventra?</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setStoreType("individual")}
                                    className={`w-full p-6 rounded-[2.5rem] border transition-all flex items-center gap-4 text-left shadow-sm ${storeType === "individual"
                                        ? "bg-black border-black text-white"
                                        : "bg-white border-black/5 text-black hover:bg-black/5"
                                        }`}
                                >
                                    <div className={`p-3 rounded-2xl ${storeType === "individual" ? "bg-white/20" : "bg-black/5"}`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">Individual Seller</h3>
                                        <p className={`text-sm ${storeType === "individual" ? "text-white/60" : "text-black/40"}`}>Selling on your own</p>
                                    </div>
                                    {storeType === "individual" && <Check className="w-6 h-6 text-white" />}
                                </button>

                                <button
                                    onClick={() => setStoreType("business")}
                                    className={`w-full p-6 rounded-[2.5rem] border transition-all flex items-center gap-4 text-left shadow-sm ${storeType === "business"
                                        ? "bg-black border-black text-white"
                                        : "bg-white border-black/5 text-black hover:bg-black/5"
                                        }`}
                                >
                                    <div className={`p-3 rounded-2xl ${storeType === "business" ? "bg-white/20" : "bg-black/5"}`}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">Business Entity</h3>
                                        <p className={`text-sm ${storeType === "business" ? "text-white/60" : "text-black/40"}`}>Registered company</p>
                                    </div>
                                    {storeType === "business" && <Check className="w-6 h-6 text-white" />}
                                </button>
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={!storeType}
                                className="w-full h-16 bg-black hover:bg-black/90 text-white rounded-full font-bold text-lg shadow-xl mt-10 transition-all active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : step === 2 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-3xl font-bold mb-8">Country</h1>

                            {/* Search bar */}
                            <div className="relative mb-6">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-black/40">
                                    <Search className="w-5 h-5" />
                                </span>
                                <Input
                                    type="text"
                                    placeholder="Search country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-14 pl-14 pr-6 rounded-full bg-black/5 border-none text-black placeholder:text-black/30 focus-visible:ring-1 focus-visible:ring-black/10"
                                />
                            </div>

                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pb-4 pr-1 custom-scrollbar">
                                {filteredCountries.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => setCountry(c)}
                                        className={`w-full p-4 rounded-3xl border transition-all flex items-center gap-4 text-left shadow-sm ${country?.code === c.code
                                            ? "bg-black border-black text-white"
                                            : "bg-white border-black/5 text-black hover:bg-black/5"
                                            }`}
                                    >
                                        <span className="text-2xl">{c.flag}</span>
                                        <span className="flex-1 font-semibold text-base">{c.name}</span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${country?.code === c.code ? "border-white bg-white" : "border-black/10"
                                            }`}>
                                            {country?.code === c.code && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={!country}
                                className="w-full h-16 bg-black hover:bg-black/90 text-white rounded-full font-bold text-lg shadow-xl mt-8 transition-all active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : step === 3 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-3xl font-bold mb-2">What's your store name?</h1>
                            <p className="text-black/50 mb-10">This is how customers will see your brand</p>

                            <div className="relative mb-8">
                                <Input
                                    type="text"
                                    placeholder="e.g. Keith's Shop"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="h-16 px-8 rounded-[2rem] bg-black/5 border-none text-black text-xl font-medium placeholder:text-black/20 focus-visible:ring-2 focus-visible:ring-black/10"
                                    autoFocus
                                />
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={storeName.length < 2}
                                className="w-full h-16 bg-black hover:bg-black/90 text-white rounded-full font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-3xl font-bold mb-2">Connect WhatsApp</h1>
                            <p className="text-black/50 mb-10">We'll use this for your customers to send orders</p>

                            <div className="relative mb-8 flex gap-3">
                                <div className="h-16 px-6 flex items-center justify-center rounded-[2rem] bg-black/5 text-black font-bold border-none">
                                    +{country?.dialCode}
                                </div>
                                <Input
                                    type="tel"
                                    placeholder="712345678"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="h-16 px-8 flex-1 rounded-[2rem] bg-black/5 border-none text-black text-xl font-medium placeholder:text-black/20 focus-visible:ring-2 focus-visible:ring-black/10"
                                    autoFocus
                                />
                            </div>

                            <Button
                                onClick={handleComplete}
                                disabled={loading || whatsapp.length < 5}
                                className="w-full h-16 bg-black hover:bg-black/90 text-white rounded-full font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Bring me to my dashboard"}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Bottom Home Indicator */}
                <div className="mt-auto pb-4 flex justify-center">
                    <div className="w-32 h-1.5 bg-black/10 rounded-full" />
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
}
