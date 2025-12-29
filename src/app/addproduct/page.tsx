"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ShoppingBag,
    Camera,
    Sparkles,
    Loader2,
    Check,
    X,
    Plus,
    ChevronRight,
    ImageIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { addProduct, getStoreByUserId } from "@/app/actions";

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [uploadingProductImage, setUploadingProductImage] = useState(false);
    const [uploadingProductFile, setUploadingProductFile] = useState(false);

    const [pendingProduct, setPendingProduct] = useState({
        name: "",
        description: "",
        price: "",
        currency: "USD",
        type: "DIGITAL",
        imageUrls: [] as string[],
        fileUrl: "",
        buttonText: "Get Started"
    });

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/onboarding");
                return;
            }
            setUser(user);
            const storeData = await getStoreByUserId(user.id);
            if (!storeData) {
                toast.error("Store not found. Please set your handle first.");
                router.push("/dashboard");
                return;
            }
            setStore(storeData);
            setLoading(false);
        }
        loadData();
    }, [router]);

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingProductImage(true);
        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-product-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);

            setPendingProduct({
                ...pendingProduct,
                imageUrls: [...pendingProduct.imageUrls, publicUrl]
            });
            toast.success("Image uploaded!");
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploadingProductImage(false);
        }
    };

    const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingProductFile(true);
        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-file-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);

            setPendingProduct({ ...pendingProduct, fileUrl: publicUrl });
            toast.success("File uploaded!");
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploadingProductFile(false);
        }
    };

    const handleSaveProduct = async () => {
        if (!store) return;
        if (!pendingProduct.name || !pendingProduct.price) {
            toast.error("Please fill in name and price");
            return;
        }

        setSaving(true);
        try {
            // Strip commas before parsing
            const numericPrice = pendingProduct.price.replace(/,/g, '');

            const res = await addProduct(store.id, {
                name: pendingProduct.name,
                description: pendingProduct.description,
                price: parseFloat(numericPrice),
                currency: pendingProduct.currency,
                type: pendingProduct.type,
                imageUrls: pendingProduct.imageUrls,
                fileUrl: pendingProduct.fileUrl,
                buttonText: pendingProduct.buttonText
            });
            if (res.success) {
                toast.success("Product created!");
                router.push("/dashboard");
            } else {
                toast.error(res.error || "Failed to add product");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#111] flex items-center justify-center md:py-10">
            <div className="w-full max-w-[440px] bg-[#F8F8F8] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative text-black h-full md:h-auto md:max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pb-32 relative custom-scrollbar">

                    {/* Product Image Section (Top) */}
                    <div className="relative aspect-[4/5] bg-slate-100 group">
                        {pendingProduct.imageUrls?.[0] ? (
                            <img src={pendingProduct.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Image Uploaded</p>
                            </div>
                        )}

                        {/* Top Controls Overlay */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                            <button
                                onClick={() => router.back()}
                                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-black flex items-center justify-center shadow-lg active:scale-90 transition-all pointer-events-auto"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-black flex items-center justify-center shadow-lg pointer-events-auto">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Upload Button Overlay */}
                        <label className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all">
                            {uploadingProductImage ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Camera className="w-5 h-5 text-black" />}
                            <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
                        </label>
                    </div>

                    {/* Product Details Section - Reimagined */}
                    <div className="bg-white rounded-t-[3rem] -mt-12 relative z-10 p-8 pt-12 space-y-12">

                        {/* Section 1: Product Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">01</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-black/90">Product Name & Price</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <input
                                        className="w-full bg-transparent border-none p-0 text-3xl font-black text-black placeholder:text-black/10 focus:ring-0 leading-tight"
                                        placeholder="Enter product name..."
                                        value={pendingProduct.name}
                                        onChange={(e) => setPendingProduct({ ...pendingProduct, name: e.target.value })}
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-black/30 bg-black/5 px-2 py-0.5 rounded-full">New Product</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-1/3 relative group">
                                        <select
                                            value={pendingProduct.currency}
                                            onChange={(e) => {
                                                const newCurrency = e.target.value;
                                                let newPrice = pendingProduct.price;
                                                if (newCurrency === "UGX") {
                                                    // Strip decimals for UGX
                                                    newPrice = newPrice.split('.')[0];
                                                }
                                                setPendingProduct({ ...pendingProduct, currency: newCurrency, price: newPrice });
                                            }}
                                            className="w-full appearance-none bg-slate-50/50 border border-black/5 rounded-2xl px-5 h-14 text-sm font-black text-black focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none cursor-pointer"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="KES">KES (Ksh)</option>
                                            <option value="UGX">UGX (USh)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Plus className="w-3.5 h-3.5 text-black rotate-45" strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-full bg-slate-50/50 border border-black/5 rounded-2xl px-6 h-14 text-lg font-black text-black placeholder:text-black/10 focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
                                            placeholder={pendingProduct.currency === "UGX" ? "0" : "0.00"}
                                            value={pendingProduct.price}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/,/g, '');
                                                if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;

                                                let val = raw;
                                                if (pendingProduct.currency === "UGX") {
                                                    val = val.split('.')[0];
                                                }

                                                const parts = val.split('.');
                                                if (parts[0] !== "") {
                                                    // Use Number to handle leading zeros but keep single '0'
                                                    parts[0] = parts[0] === "0" ? "0" : Number(parts[0]).toLocaleString('en-US');
                                                }

                                                // Reconstruct without losing the decimal point if user is still typing it
                                                const formatted = parts.join(val.includes('.') && pendingProduct.currency !== "UGX" ? '.' : '');

                                                setPendingProduct({ ...pendingProduct, price: formatted });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Description */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">02</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-black/90">Description</h3>
                            </div>

                            <textarea
                                className="w-full bg-slate-50/50 border border-black/5 rounded-[2rem] p-6 text-base font-bold text-black/60 leading-relaxed placeholder:text-black/10 min-h-[140px] resize-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
                                placeholder="Describe your product here..."
                                value={pendingProduct.description}
                                onChange={(e) => setPendingProduct({ ...pendingProduct, description: e.target.value })}
                            />
                        </div>

                        {/* Section 3: Format (Type) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">03</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-black/90">Product Format</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/50 rounded-[20px] border border-black/5">
                                <button
                                    onClick={() => setPendingProduct({ ...pendingProduct, type: "DIGITAL" })}
                                    className={`h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${pendingProduct.type === "DIGITAL" ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-black/40 hover:text-black/60'}`}
                                >
                                    Digital Asset
                                </button>
                                <button
                                    onClick={() => setPendingProduct({ ...pendingProduct, type: "SERVICE" })}
                                    className={`h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${pendingProduct.type === "SERVICE" ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-black/40 hover:text-black/60'}`}
                                >
                                    Service
                                </button>
                            </div>
                        </div>

                        {/* Section 4: Digital File */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">04</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-black/90">Digital File</h3>
                            </div>

                            {pendingProduct.type === "DIGITAL" ? (
                                <div className="space-y-4">
                                    {pendingProduct.fileUrl ? (
                                        <div className="flex items-center gap-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5">
                                            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-black uppercase tracking-tight">File Attached</p>
                                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Ready for upload</p>
                                            </div>
                                            <button onClick={() => setPendingProduct({ ...pendingProduct, fileUrl: "" })} className="w-10 h-10 rounded-full flex items-center justify-center text-black/20 hover:text-red-500 hover:bg-red-50 transition-all">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center gap-3 p-10 rounded-[2rem] bg-slate-50/50 border-2 border-dashed border-black/5 cursor-pointer hover:bg-white hover:border-black/20 transition-all group">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform ring-1 ring-black/5">
                                                {uploadingProductFile ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Plus className="w-5 h-5 text-black" strokeWidth={3} />}
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-xs font-black text-black uppercase tracking-tight">Upload File</span>
                                                <span className="block text-[9px] text-black/30 font-black uppercase tracking-widest mt-1">ZIP, PDF, MP4 (MAX 500MB)</span>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleProductFileUpload} />
                                        </label>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 rounded-2xl bg-slate-50/50 border border-black/5 text-center">
                                    <Sparkles className="w-6 h-6 text-black/10 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-black/40 leading-relaxed max-w-[200px] mx-auto">
                                        Post-checkout instructions will be sent automatically.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-black/5 z-20">
                    <button
                        onClick={handleSaveProduct}
                        disabled={saving || !pendingProduct.name || !pendingProduct.price}
                        className="w-full h-16 bg-black text-white rounded-[1.5rem] font-black text-base shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Product"}
                        {!saving && <ChevronRight className="w-5 h-5 opacity-40" />}
                    </button>
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
            `}</style>
        </div>
    );
}
