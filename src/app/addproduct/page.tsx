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
        fileUrl: "", // Legacy single file
        buttonText: "Get Started"
    });

    const [digitalFiles, setDigitalFiles] = useState<{ name: string; fileUrl: string; size: number }[]>([]);

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
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingProductFile(true);
        try {
            const supabase = createClient();
            const newUploadedFiles: { name: string; fileUrl: string; size: number }[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-file-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, file, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                // Extract clean name from filename
                const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

                newUploadedFiles.push({
                    name: cleanName,
                    fileUrl: publicUrl,
                    size: file.size
                });
            }

            setDigitalFiles([...digitalFiles, ...newUploadedFiles]);

            // If it's the first file and name is empty, auto-fill it
            if (digitalFiles.length === 0 && newUploadedFiles.length === 1 && !pendingProduct.name) {
                setPendingProduct(prev => ({ ...prev, name: newUploadedFiles[0].name }));
            }

            toast.success(`${files.length} file(s) uploaded!`);
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploadingProductFile(false);
        }
    };

    const handleSaveProduct = async () => {
        if (!store) return;

        // Validation
        if (!pendingProduct.price) {
            toast.error("Please enter a price");
            return;
        }

        if (pendingProduct.type === "DIGITAL" && digitalFiles.length === 0) {
            toast.error("Please upload at least one digital asset");
            return;
        }

        if (pendingProduct.type !== "DIGITAL" && !pendingProduct.name) {
            toast.error("Please enter a product name");
            return;
        }

        setSaving(true);
        try {
            const numericPrice = pendingProduct.price.replace(/,/g, '');

            if (pendingProduct.type === "DIGITAL" && digitalFiles.length > 0) {
                // Batch create products
                for (const fileData of digitalFiles) {
                    await addProduct(store.id, {
                        name: fileData.name, // Use the extracted name from filename
                        description: pendingProduct.description,
                        price: parseFloat(numericPrice),
                        currency: pendingProduct.currency,
                        type: "DIGITAL",
                        imageUrls: pendingProduct.imageUrls,
                        fileUrl: fileData.fileUrl,
                        buttonText: pendingProduct.buttonText
                    });
                }
                toast.success(`${digitalFiles.length} products created!`);
            } else {
                // Single creation for Service/Physical
                const res = await addProduct(store.id, {
                    name: pendingProduct.name,
                    description: pendingProduct.description,
                    price: parseFloat(numericPrice),
                    currency: pendingProduct.currency,
                    type: pendingProduct.type,
                    imageUrls: pendingProduct.imageUrls,
                    fileUrl: "",
                    buttonText: pendingProduct.buttonText
                });
                if (!res.success) throw new Error(res.error);
                toast.success("Product created!");
            }

            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to add product");
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
        <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center md:py-10 font-sans selection:bg-purple-500/30 selection:text-white">
            <div className="w-full max-w-[440px] bg-zinc-900 md:rounded-2xl overflow-hidden shadow-2xl relative text-white h-full md:h-auto md:max-h-[90vh] flex flex-col border border-white/5">

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pb-32 relative custom-scrollbar">

                    {/* Product Image Section (Top) */}
                    <div className="relative aspect-[4/5] bg-black/20 group">
                        {pendingProduct.imageUrls?.[0] ? (
                            <img src={pendingProduct.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                                <ImageIcon className="w-16 h-16 mb-2 opacity-30" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-50">No Image Uploaded</p>
                            </div>
                        )}

                        {/* Top Controls Overlay */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                            <button
                                onClick={() => router.back()}
                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white/10 pointer-events-auto"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/10 pointer-events-auto">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Upload Button Overlay */}
                        <label className="absolute bottom-20 right-6 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all z-20">
                            {uploadingProductImage ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Camera className="w-5 h-5 text-black" />}
                            <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
                        </label>
                    </div>

                    {/* Product Details Section */}
                    <div className="bg-zinc-900 rounded-t-2xl -mt-12 relative z-10 p-6 pt-10 space-y-10">

                        {/* Section 1: Product Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">01</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Product Name & Price</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <input
                                        className="w-full bg-transparent border-none p-0 text-3xl font-black text-white placeholder:text-zinc-800 focus:ring-0 leading-tight"
                                        placeholder={pendingProduct.type === "DIGITAL" && digitalFiles.length > 1 ? "Batch Upload Enabled..." : "Enter product name..."}
                                        value={pendingProduct.name}
                                        onChange={(e) => {
                                            setPendingProduct({ ...pendingProduct, name: e.target.value });
                                            // Sync with the first digital file if only one exists
                                            if (pendingProduct.type === "DIGITAL" && digitalFiles.length === 1) {
                                                const newFiles = [...digitalFiles];
                                                newFiles[0].name = e.target.value;
                                                setDigitalFiles(newFiles);
                                            }
                                        }}
                                        disabled={pendingProduct.type === "DIGITAL" && digitalFiles.length > 1}
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded-full">
                                            {pendingProduct.type === "DIGITAL" && digitalFiles.length > 1 ? `${digitalFiles.length} Products detected` : "New Product"}
                                        </span>
                                        {pendingProduct.type === "DIGITAL" && digitalFiles.length > 1 && (
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Names will be set from filenames</span>
                                        )}
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
                                                    newPrice = newPrice.split('.')[0];
                                                }
                                                setPendingProduct({ ...pendingProduct, currency: newCurrency, price: newPrice });
                                            }}
                                            className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl px-5 h-14 text-sm font-black text-white focus:ring-2 focus:ring-purple-500/20 focus:bg-black/60 transition-all outline-none cursor-pointer"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="KES">KES (Ksh)</option>
                                            <option value="UGX">UGX (USh)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Plus className="w-3.5 h-3.5 text-white rotate-45" strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-6 h-14 text-lg font-black text-white placeholder:text-zinc-800 focus:ring-2 focus:ring-purple-500/20 focus:bg-black/60 transition-all outline-none"
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
                                                    parts[0] = parts[0] === "0" ? "0" : Number(parts[0]).toLocaleString('en-US');
                                                }

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
                                <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">02</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Description</h3>
                            </div>

                            <textarea
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-base font-bold text-zinc-400 leading-relaxed placeholder:text-zinc-800 min-h-[140px] resize-none focus:ring-2 focus:ring-purple-500/20 focus:bg-black/60 transition-all outline-none"
                                placeholder="Describe your product here..."
                                value={pendingProduct.description}
                                onChange={(e) => setPendingProduct({ ...pendingProduct, description: e.target.value })}
                            />
                        </div>

                        {/* Section 3: Format (Type) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">03</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Product Format</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setPendingProduct({ ...pendingProduct, type: "DIGITAL" })}
                                    className={`h-11 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-300 ${pendingProduct.type === "DIGITAL" ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    Digital Asset
                                </button>
                                <button
                                    onClick={() => setPendingProduct({ ...pendingProduct, type: "SERVICE" })}
                                    className={`h-11 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-300 ${pendingProduct.type === "SERVICE" ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    Service
                                </button>
                                <button
                                    onClick={() => setPendingProduct({ ...pendingProduct, type: "PHYSICAL" })}
                                    className={`h-11 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-300 ${pendingProduct.type === "PHYSICAL" ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    Physical
                                </button>
                            </div>
                        </div>

                        {/* Section 4: Digital File */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">04</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Format Details</h3>
                            </div>

                            {pendingProduct.type === "DIGITAL" ? (
                                <div className="space-y-4">
                                    {digitalFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {digitalFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-5 bg-purple-900/10 border border-purple-500/20 rounded-xl p-5">
                                                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                                                        <Check className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <input
                                                            value={file.name}
                                                            onChange={(e) => {
                                                                const newFiles = [...digitalFiles];
                                                                newFiles[idx].name = e.target.value;
                                                                setDigitalFiles(newFiles);
                                                                // Sync with main name if it's the only file
                                                                if (digitalFiles.length === 1) {
                                                                    setPendingProduct(prev => ({ ...prev, name: e.target.value }));
                                                                }
                                                            }}
                                                            className="w-full bg-transparent border-none p-0 text-xs font-black text-white uppercase tracking-tight outline-none focus:ring-0 placeholder:text-zinc-600"
                                                            placeholder="Product Name"
                                                        />
                                                        <p className="text-[9px] text-purple-400 font-black uppercase tracking-widest mt-0.5">
                                                            {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setDigitalFiles(digitalFiles.filter((_, i) => i !== idx))}
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl bg-black/40 border-2 border-dashed border-white/5 cursor-pointer hover:bg-black/60 hover:border-white/10 transition-all group">
                                        <div className="w-14 h-14 rounded-xl bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {uploadingProductFile ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Plus className="w-5 h-5 text-black" strokeWidth={3} />}
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-black text-white uppercase tracking-tight">
                                                {digitalFiles.length > 0 ? "Add More Files" : "Upload Digital Assets"}
                                            </span>
                                            <span className="block text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">ZIP, PDF, MP4 (Multiple selection enabled)</span>
                                        </div>
                                        <input type="file" className="hidden" multiple onChange={handleProductFileUpload} />
                                    </label>
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl bg-black/40 border border-white/5 text-center">
                                    <Sparkles className="w-6 h-6 text-purple-500/20 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-zinc-500 leading-relaxed max-w-[200px] mx-auto">
                                        Checkout for this {pendingProduct.type.toLowerCase()} will be handled via WhatsApp.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 z-20">
                    <button
                        onClick={handleSaveProduct}
                        disabled={saving || !pendingProduct.name || !pendingProduct.price}
                        className="w-full h-14 bg-white text-black rounded-xl font-black text-base shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
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
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
