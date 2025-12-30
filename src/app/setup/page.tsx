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
    const [sellingType, setSellingType] = useState<"digital" | "service" | "physical" | null>(null);
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
        if (step === 1 && sellingType) {
            // If digital, skip country (step 2) and go to store name (step 3)
            if (sellingType === "digital") {
                setStep(3);
            } else {
                setStep(2);
            }
        } else if (step === 2 && country) {
            setStep(3);
        } else if (step === 3 && storeName.length >= 2) {
            // If digital, we finished name, so we are done
            if (sellingType === "digital") {
                handleComplete();
            } else {
                setStep(4);
            }
        }
    };

    const handleBack = () => {
        if (step === 3 && sellingType === "digital") {
            setStep(1);
        } else if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        // WhatsApp only required for Non-Digital products per user request
        if (sellingType !== "digital" && !whatsapp) {
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
            const fullWhatsapp = (sellingType !== "digital" && country) ? `${country.dialCode}${whatsapp.replace(/[^0-9]/g, '')}` : "";

            const res = await createStore(
                user.id,
                user.email,
                generatedSlug,
                storeName,
                (sellingType !== "digital" ? country?.name : ""),
                sellingType || undefined,
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
                                className={`h-1.5 rounded-full ${i === step
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
                        <div>
                            <h1 className="text-3xl font-bold mb-2">What are you going to sell?</h1>
                            <p className="text-black/50 mb-8">Choose your primary product type</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setSellingType("digital")}
                                    className={`w-full p-5 rounded-2xl border transition-all flex items-center gap-4 text-left shadow-sm ${sellingType === "digital"
                                        ? "bg-black border-black text-white"
                                        : "bg-white border-black/5 text-black hover:bg-black/5"
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${sellingType === "digital" ? "bg-white/20" : "bg-black/5"}`}>
                                        <div className="w-5 h-5 flex items-center justify-center font-bold">DIG</div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base">Digital Assets</h3>
                                        <p className={`text-xs ${sellingType === "digital" ? "text-white/60" : "text-black/40"}`}>Files, courses, or presets</p>
                                    </div>
                                    {sellingType === "digital" && <Check className="w-5 h-5 text-white" />}
                                </button>

                                <button
                                    onClick={() => setSellingType("service")}
                                    className={`w-full p-5 rounded-2xl border transition-all flex items-center gap-4 text-left shadow-sm ${sellingType === "service"
                                        ? "bg-black border-black text-white"
                                        : "bg-white border-black/5 text-black hover:bg-black/5"
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${sellingType === "service" ? "bg-white/20" : "bg-black/5"}`}>
                                        <div className="w-5 h-5 flex items-center justify-center font-bold">SRV</div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base">Professional Services</h3>
                                        <p className={`text-sm ${sellingType === "service" ? "text-white/60" : "text-black/40"}`}>Consulting or booking</p>
                                    </div>
                                    {sellingType === "service" && <Check className="w-5 h-5 text-white" />}
                                </button>

                                <button
                                    onClick={() => setSellingType("physical")}
                                    className={`w-full p-5 rounded-2xl border transition-all flex items-center gap-4 text-left shadow-sm ${sellingType === "physical"
                                        ? "bg-black border-black text-white"
                                        : "bg-white border-black/5 text-black hover:bg-black/5"
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${sellingType === "physical" ? "bg-white/20" : "bg-black/5"}`}>
                                        <div className="w-5 h-5 flex items-center justify-center font-bold">PHY</div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base">Physical Products</h3>
                                        <p className={`text-sm ${sellingType === "physical" ? "text-white/60" : "text-black/40"}`}>Physical goods & delivery</p>
                                    </div>
                                    {sellingType === "physical" && <Check className="w-5 h-5 text-white" />}
                                </button>
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={!sellingType}
                                className="w-full h-14 bg-black hover:bg-black/90 text-white rounded-2xl font-bold text-base shadow-xl mt-10 transition-all active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : step === 2 ? (
                        <div>
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
                                    className="h-12 pl-14 pr-6 rounded-2xl bg-black/5 border-none text-black placeholder:text-black/30 focus-visible:ring-1 focus-visible:ring-black/10"
                                />
                            </div>

                            <div className="space-y-2 max-h-[50vh] overflow-y-auto pb-4 pr-1 custom-scrollbar">
                                {filteredCountries.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => setCountry(c)}
                                        className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 text-left shadow-sm ${country?.code === c.code
                                            ? "bg-black border-black text-white"
                                            : "bg-white border-black/5 text-black hover:bg-black/5"
                                            }`}
                                    >
                                        <span className="text-xl">{c.flag}</span>
                                        <span className="flex-1 font-bold text-sm">{c.name}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${country?.code === c.code ? "border-white bg-white" : "border-black/10"
                                            }`}>
                                            {country?.code === c.code && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={!country}
                                className="w-full h-14 bg-black hover:bg-black/90 text-white rounded-2xl font-bold text-base shadow-xl mt-8 transition-all active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : step === 3 ? (
                        <div>
                            <h1 className="text-3xl font-bold mb-2">What's your store name?</h1>
                            <p className="text-black/50 mb-10">This is how customers will see your brand</p>

                            <div className="relative mb-8">
                                <Input
                                    type="text"
                                    placeholder="e.g. Keith's Shop"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-black/5 border-none text-black text-lg font-bold placeholder:text-black/20 focus-visible:ring-2 focus-visible:ring-black/10"
                                    autoFocus
                                />
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={storeName.length < 2}
                                className="w-full h-14 bg-black hover:bg-black/90 text-white rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Connect WhatsApp</h1>
                            <p className="text-black/50 mb-10">We'll use this for your customers to send orders</p>

                            <div className="relative mb-8 flex gap-3">
                                <div className="h-14 px-5 flex items-center justify-center rounded-2xl bg-black/5 text-black font-bold border-none text-base">
                                    +{country?.dialCode}
                                </div>
                                <Input
                                    type="tel"
                                    placeholder="712345678"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="h-14 px-6 flex-1 rounded-2xl bg-black/5 border-none text-black text-lg font-bold placeholder:text-black/20 focus-visible:ring-2 focus-visible:ring-black/10"
                                    autoFocus
                                />
                            </div>

                            <Button
                                onClick={handleComplete}
                                disabled={loading || whatsapp.length < 5}
                                className="w-full h-14 bg-black hover:bg-black/90 text-white rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Bring me to my dashboard"}
                            </Button>
                        </div>
                    )}
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
