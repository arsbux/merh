"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus, Store, ExternalLink, User, Trash2, Type, Youtube, ImageIcon,
    Link as LinkIcon, Loader2, ChevronRight, LogOut, Edit2, ChevronUp,
    ChevronDown, Palette, Upload, Camera, Layout, Pipette, Share2,
    Package, Home, BarChart3, ShoppingBag, Settings, Banknote, Info,
    X, ToggleLeft, ToggleRight, PenTool, Copy, Clock, Sparkles,
    Wrench, Download, Smartphone, ChevronLeft, Check, Heart, MoreVertical
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    updateStoreProfile, addStoreLink, deleteStoreLink, getStoreByUserId,
    updateStoreLinks, updateStoreSlug, checkSlugAvailability, addProduct,
    updateProduct, deleteProduct, toggleProductPublished, getProductsByStoreId
} from "@/app/actions";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { DashboardHeader } from "@/components/dashboard/Header";
import { ProductsView } from "@/components/dashboard/views/ProductsView";
import { SettingsView } from "@/components/dashboard/views/SettingsView";
import { ToolsView } from "@/components/dashboard/views/ToolsView";
import { EarningsView } from "@/components/dashboard/views/EarningsView";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const [isEditingSlug, setIsEditingSlug] = useState(false);
    const [newSlug, setNewSlug] = useState("");
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [editingBlock, setEditingBlock] = useState<any | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [pendingBlock, setPendingBlock] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [textEditorContent, setTextEditorContent] = useState("");

    const [store, setStore] = useState<any>(null);
    const [profile, setProfile] = useState({
        name: "",
        bio: "",
        avatarUrl: "",
        bannerUrl: "",
        themeColor: "#000000",
        headerLayout: "MODERN_CARD",
        storeLayout: "LIST_DETAIL",
        socialLinks: { instagram: "", x: "", youtube: "", facebook: "", reddit: "", whatsapp: "", email: "" }
    });

    const [links, setLinks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'store' | 'products' | 'tools' | 'settings' | 'earnings'>('store');
    const [products, setProducts] = useState<any[]>([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [uploadingProductImage, setUploadingProductImage] = useState(false);
    const [uploadingProductFile, setUploadingProductFile] = useState(false);

    const [payoutDetails, setPayoutDetails] = useState({
        provider: "M-Pesa (Kenya)",
        accountName: "",
        accountNumber: ""
    });
    const [savingPayout, setSavingPayout] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isPWAInstalled, setIsPWAInstalled] = useState(false);

    interface ProductData {
        name: string;
        description: string;
        price: string;
        type: string;
        imageUrls: string[];
        fileUrl: string;
        buttonText: string;
        currency: string;
    }

    const [pendingProduct, setPendingProduct] = useState<ProductData>({
        name: "",
        description: "",
        price: "",
        type: "DIGITAL",
        imageUrls: [],
        fileUrl: "",
        buttonText: "I want this",
        currency: "UGX"
    });

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);
            const storeData = await getStoreByUserId(user.id);
            if (storeData) {
                setStore(storeData);
                setNewSlug(storeData.slug || "");
                setProfile({
                    name: storeData.name || "",
                    bio: storeData.bio || "",
                    avatarUrl: storeData.avatarUrl || "",
                    bannerUrl: storeData.bannerUrl || "",
                    themeColor: storeData.themeColor || "#000000",
                    headerLayout: storeData.headerLayout || "MODERN_CARD",
                    storeLayout: storeData.storeLayout || "LIST_DETAIL",
                    socialLinks: {
                        instagram: "", x: "", youtube: "", facebook: "", reddit: "", whatsapp: "", email: "",
                        ...(storeData.socialLinks as any || {})
                    }
                });
                setLinks(storeData.links || []);
                const productData = await getProductsByStoreId(storeData.id);
                setProducts(productData);
                if (storeData.payoutDetails) {
                    setPayoutDetails(storeData.payoutDetails);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const profileRes = await updateStoreProfile(user.id, {
            name: profile.name,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            bannerUrl: profile.bannerUrl,
            themeColor: profile.themeColor,
            headerLayout: profile.headerLayout,
            storeLayout: profile.storeLayout,
            socialLinks: profile.socialLinks,
            whatsapp: profile.socialLinks.whatsapp,
            payoutDetails: payoutDetails
        });

        const linksRes = await updateStoreLinks(links.map((l, i) => ({
            id: l.id,
            title: l.title,
            url: l.url,
            order: i
        })));

        if (profileRes.success && linksRes.success) {
            if (profileRes.store) {
                setStore({ ...store, ...profileRes.store });
            }
            toast.success("Changes published!");
            setHasChanges(false);
        } else {
            toast.error("Some changes failed to save");
        }
        setSaving(false);
    };

    const handleOpenEditModal = (link: any) => {
        if (link.type === 'TEXT') {
            setTextEditorContent(link.url || "");
        }
        setEditingBlock(link);
    };

    const handleOpenAddModal = (type: string) => {
        if (type === 'TEXT') {
            setTextEditorContent("");
        }
        setPendingBlock({
            type,
            title: "",
            url: type === 'TEXT' ? "" : "https://",
            file: null
        });
        setIsAddMenuOpen(false);
    };

    const confirmAddBlock = async () => {
        if (!store || !pendingBlock) return;
        setIsCreating(true);

        try {
            let finalUrl = pendingBlock.url;

            if (pendingBlock.type === 'TEXT') {
                finalUrl = textEditorContent;
                pendingBlock.title = textEditorContent.slice(0, 30);
            }

            if (pendingBlock.type === 'IMAGE' && pendingBlock.file) {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const file = pendingBlock.file;
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-pending-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                finalUrl = publicUrl;
            }

            const res = await addStoreLink(store.id, {
                title: pendingBlock.title || (pendingBlock.type === 'TEXT' ? "Message" : "Link"),
                url: finalUrl,
                type: pendingBlock.type
            });

            if (res.success) {
                setLinks([...links, res.link]);
                toast.success(`${pendingBlock.type} added!`);
                setPendingBlock(null);
            }
        } catch (error) {
            toast.error("Failed to add block");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        const res = await deleteStoreLink(id);
        if (res.success) {
            setLinks(links.filter(l => l.id !== id));
            toast.success("Block removed");
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((err) => {
                console.error("Service worker registration failed:", err);
            });
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsPWAInstalled(true);
        }
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handlePWAInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsPWAInstalled(true);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    };

    const confirmEditBlock = async () => {
        if (!editingBlock) return;
        setSaving(true);
        try {
            const finalUrl = editingBlock.type === 'TEXT' ? textEditorContent : editingBlock.url;
            const res = await updateStoreLinks([{
                id: editingBlock.id,
                title: editingBlock.title,
                url: finalUrl,
                order: links.findIndex(l => l.id === editingBlock.id)
            }]);

            if (res.success) {
                setLinks(links.map(l => l.id === editingBlock.id ? { ...editingBlock, url: finalUrl } : l));
                setEditingBlock(null);
                toast.success("Block updated!");
            }
        } catch (error) {
            toast.error("Failed to update block");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploadingAvatar(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            setProfile({ ...profile, avatarUrl: publicUrl });
            setHasChanges(true);
            toast.success("Profile picture uploaded!");
        } catch (error: any) {
            toast.error("Upload failed: " + (error.message || "Unknown error"));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSlugCheck = async (slug: string) => {
        setNewSlug(slug);
        if (!slug || slug.length < 3) {
            setIsSlugAvailable(null);
            return;
        }
        setIsCheckingSlug(true);
        const { available, error } = await checkSlugAvailability(slug, user?.id);
        if (error) {
            setIsSlugAvailable(null);
        } else {
            setIsSlugAvailable(available);
        }
        setIsCheckingSlug(false);
    };

    const handleSaveSlug = async () => {
        if (!user || !newSlug) return;
        const res = await updateStoreSlug(user.id, newSlug);
        if (res.success) {
            setStore({ ...store, slug: newSlug });
            setIsEditingSlug(false);
            toast.success("Handle updated!");
        } else {
            toast.error(res.error || "Failed to update handle");
        }
    };

    const resetProductForm = () => {
        setPendingProduct({
            name: "",
            description: "",
            price: "",
            currency: "UGX",
            type: "DIGITAL",
            imageUrls: [],
            fileUrl: "",
            buttonText: "I want this"
        });
        setEditingProduct(null);
    };

    const handleOpenAddProduct = () => {
        resetProductForm();
        setIsProductModalOpen(true);
    };

    const handleOpenEditProduct = (product: any) => {
        setEditingProduct(product);
        setPendingProduct({
            name: product.name || "",
            description: product.description || "",
            price: product.price?.toString() || "",
            type: product.type || "DIGITAL",
            imageUrls: product.imageUrls || [],
            fileUrl: product.fileUrl || "",
            buttonText: product.buttonText || "I want this",
            currency: product.currency || "UGX"
        });
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!store) {
            toast.error("Store not found");
            return;
        }
        if (!pendingProduct.name || !pendingProduct.price) {
            toast.error("Please fill in all required fields");
            return;
        }
        setSaving(true);
        try {
            const productData = {
                name: pendingProduct.name,
                description: pendingProduct.description,
                price: parseFloat(pendingProduct.price),
                type: pendingProduct.type,
                imageUrls: pendingProduct.imageUrls,
                fileUrl: pendingProduct.fileUrl,
                buttonText: pendingProduct.buttonText,
                currency: pendingProduct.currency
            };
            const res = editingProduct ? await updateProduct(editingProduct.id, productData) : await addProduct(store.id, productData);
            if (res.success) {
                const refreshedProducts = await getProductsByStoreId(store.id);
                setProducts(refreshedProducts);
                toast.success(editingProduct ? "Product updated!" : "Product added!");
                setIsProductModalOpen(false);
                resetProductForm();
            } else {
                toast.error(res.error || "Failed to save product");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        const res = await deleteProduct(productId);
        if (res.success) {
            setProducts(products.filter(p => p.id !== productId));
            toast.success("Product deleted");
        }
    };

    const handleTogglePublish = async (productId: string, currentStatus: boolean) => {
        const res = await toggleProductPublished(productId, !currentStatus);
        if (res.success) {
            setProducts(products.map(p => p.id === productId ? { ...p, isPublished: !currentStatus } : p));
        }
    };

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingProductImage(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            const fileName = `${user.id}-product-${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
            setPendingProduct({ ...pendingProduct, imageUrls: [publicUrl] }); // Simplified to single image for now
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            const fileName = `${user.id}-file-${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
            setPendingProduct({ ...pendingProduct, fileUrl: publicUrl });
            toast.success("File uploaded!");
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploadingProductFile(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 selection:bg-black selection:text-white pb-32 font-sans md:pb-0">
            <DashboardHeader
                store={store}
                activeTab={activeTab}
                setIsEditingSlug={setIsEditingSlug}
                setActiveTab={setActiveTab}
            />
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className={`transition-all duration-500 md:pl-20 ${activeTab === 'store' ? 'w-full pb-0' : 'w-full max-w-[480px] md:max-w-none mx-auto pt-24 px-6 pb-32'}`}>
                {activeTab === 'settings' && (
                    <SettingsView
                        user={user} store={store} profile={profile} setProfile={setProfile}
                        setHasChanges={setHasChanges}
                        isEditingSlug={isEditingSlug}
                        setIsEditingSlug={setIsEditingSlug} newSlug={newSlug}
                        setNewSlug={setNewSlug} isSlugAvailable={isSlugAvailable}
                        isCheckingSlug={isCheckingSlug} handleSlugCheck={handleSlugCheck}
                        handleSaveSlug={handleSaveSlug} isPWAInstalled={isPWAInstalled}
                        deferredPrompt={deferredPrompt} handlePWAInstall={handlePWAInstall}
                        handleLogout={handleLogout}
                    />
                )}

                {activeTab === 'products' && (
                    <ProductsView
                        products={products} handleOpenAddProduct={handleOpenAddProduct}
                        handleOpenEditProduct={handleOpenEditProduct}
                        handleDeleteProduct={handleDeleteProduct}
                        handleTogglePublish={handleTogglePublish}
                        store={store}
                    />
                )}

                {activeTab === 'store' && (
                    <div className="min-h-screen w-full flex flex-col items-center pt-20 pb-32 px-4 bg-white text-black transition-colors duration-500">
                        {/* Edit Hint */}
                        <div className="fixed top-28 right-4 z-40">
                            <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-2">
                                <PenTool className="w-3 h-3" /> Tap items to edit
                            </div>
                        </div>

                        {/* Store Header Preview */}
                        <div
                            onClick={() => setIsEditingProfile(true)}
                            className="w-full max-w-[480px] cursor-pointer relative group flex items-start gap-4 mb-10 pt-12"
                        >
                            <div className="absolute inset-0 z-30 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl backdrop-blur-[1px]">
                                <span className="font-bold text-black bg-white/80 px-4 py-2 rounded-full border border-black/10 shadow-sm text-xs">Edit Profile</span>
                            </div>

                            <div className="flex flex-col items-center gap-3 w-1/3 text-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-black/5 shadow-inner">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-10 h-10 opacity-10" />
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-lg font-black tracking-tight leading-tight text-black">{profile.name || "Store Name"}</h1>
                            </div>

                            {profile.bio && (
                                <div className="flex-1 min-h-[120px] bg-[#EAEAEA] rounded-xl p-5 flex items-center justify-center text-center">
                                    <p className="text-xs font-bold leading-relaxed text-black/60">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Store Social Links (Dashboard Preview) */}
                        <div className="w-full max-w-[480px] mb-12 flex justify-start gap-4">
                            <div className="flex gap-4">
                                {profile.socialLinks.instagram && <img src="/socials/instagram.png" className="w-8 h-8 opacity-80" />}
                                {profile.socialLinks.x && <img src="/socials/x.png" className="w-8 h-8 opacity-80" />}
                                {profile.socialLinks.whatsapp && <img src="/socials/whatsapp.png" className="w-8 h-8 opacity-80" />}
                                {profile.socialLinks.email && <img src="/socials/mail.png" className="w-8 h-8 opacity-80" />}
                            </div>
                        </div>

                        {/* Products Grid Preview - Fixed to match live behavior */}
                        {products.length > 0 && (
                            <div className="w-full max-w-[480px]">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                    {products.map((product: any) => (
                                        <div
                                            key={product.id}
                                            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 shadow-sm border border-black/5 group/prod"
                                        >
                                            {product.imageUrls?.[0] ? (
                                                <img
                                                    src={product.imageUrls[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-black/10">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}

                                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center">
                                                <Heart className="w-4 h-4 text-white" />
                                            </div>

                                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                                            <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                                                <h3 className="text-xs font-bold leading-tight line-clamp-1 opacity-90">{product.name}</h3>
                                                <p className="text-base font-black mt-0.5">
                                                    {product.currency === 'UGX' ? 'USh' : '$'}{parseFloat(product.price || 0).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer - Exactly like live */}
                        <footer className="w-full pt-12 pb-8 text-center mt-auto flex flex-col items-center gap-4">
                            <p className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase flex items-center gap-2 text-black">
                                Powered By Ventra <MoreVertical className="w-3 h-3" />
                            </p>
                        </footer>
                    </div>
                )}

                {activeTab === 'tools' && <ToolsView />}
                {activeTab === 'earnings' && (
                    <EarningsView
                        payoutDetails={payoutDetails} setPayoutDetails={setPayoutDetails}
                        savingPayout={savingPayout}
                        onSavePayout={async () => {
                            setSavingPayout(true);
                            const res = await updateStoreProfile(user.id, { payoutDetails });
                            if (res.success) toast.success("Payout details saved!");
                            setSavingPayout(false);
                        }}
                    />
                )}
            </main>

            <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 px-4 w-full max-w-[450px]">
                <div className="flex-1">
                    {hasChanges && (
                        <button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-full bg-black text-white font-bold text-lg shadow-xl hover:bg-slate-800 transition-all">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Changes"}
                        </button>
                    )}
                </div>
                <div className="relative group/plus">
                    <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className={`h-14 w-14 rounded-full font-black shadow-xl transition-all border flex items-center justify-center ${isAddMenuOpen ? 'bg-white text-black border-slate-200 rotate-45' : 'bg-black text-white border-transparent'}`}>
                        <Plus className="w-6 h-6" strokeWidth={3} />
                    </button>
                    {isAddMenuOpen && (
                        <div className="absolute bottom-20 right-0 w-64 bg-white rounded-2xl p-2 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 overflow-hidden z-50 ring-1 ring-black/5">
                            <div className="grid grid-cols-1 gap-0.5">
                                <button onClick={() => handleOpenAddModal('TEXT')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center group-hover:shadow-sm transition-all"><Type className="w-5 h-5 text-sky-500" /></div>
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Add Text</span>
                                </button>
                                <button onClick={() => handleOpenAddModal('YOUTUBE')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:shadow-sm transition-all"><Youtube className="w-5 h-5 text-red-500" /></div>
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Video URL</span>
                                </button>
                                <button onClick={() => handleOpenAddModal('URL')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:shadow-sm transition-all"><LinkIcon className="w-5 h-5 text-emerald-500" /></div>
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Button Link</span>
                                </button>
                                <button onClick={() => handleOpenAddModal('IMAGE')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:shadow-sm transition-all"><ImageIcon className="w-5 h-5 text-purple-500" /></div>
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Photo</span>
                                </button>
                                <button onClick={() => router.push('/addproduct')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-black transition-all"><ShoppingBag className="w-5 h-5 text-white" /></div>
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-black">Sell Product</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {pendingBlock && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative text-slate-900 ring-1 ring-black/5">
                        <div className="space-y-5">
                            {pendingBlock.type !== 'TEXT' && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Title</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl h-14 px-4 font-bold" value={pendingBlock.title} onChange={(e) => setPendingBlock({ ...pendingBlock, title: e.target.value })} autoFocus />
                                </div>
                            )}
                            {pendingBlock.type === 'TEXT' && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Message</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[160px] resize-none" value={textEditorContent} onChange={(e) => setTextEditorContent(e.target.value)} autoFocus />
                                </div>
                            )}
                            {pendingBlock.type === 'IMAGE' && (
                                <div className="relative min-h-[160px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                                    {pendingBlock.file ? <img src={URL.createObjectURL(pendingBlock.file)} className="w-full h-auto" /> : <div className="text-xs font-bold text-slate-500 uppercase">Click to upload image</div>}
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files?.[0]; if (file) setPendingBlock({ ...pendingBlock, file }); }} />
                                </div>
                            )}
                            {(pendingBlock.type === 'URL' || pendingBlock.type === 'YOUTUBE') && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Link</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl h-14 px-4 font-mono text-sm" value={pendingBlock.url} onChange={(e) => setPendingBlock({ ...pendingBlock, url: e.target.value })} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 mt-8">
                            <button onClick={confirmAddBlock} disabled={isCreating} className="h-14 rounded-xl bg-black text-white font-bold transition-all disabled:opacity-50">
                                {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Block"}
                            </button>
                            <button onClick={() => setPendingBlock(null)} className="h-12 rounded-xl font-bold text-sm text-slate-400">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {(editingBlock || isEditingProfile) && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative text-slate-900 ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
                        <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors group" onClick={() => { setEditingBlock(null); setIsEditingProfile(false); }}>
                            <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600 rotate-45" />
                        </button>

                        {isEditingProfile ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-center">
                                    <div className="relative w-28 h-28 group/avatar">
                                        <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-slate-100">
                                            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><User className="w-10 h-10 text-slate-300" /></div>}
                                        </div>
                                        {uploadingAvatar ? (
                                            <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-20"><Loader2 className="w-6 h-6 animate-spin text-slate-900" /></div>
                                        ) : (
                                            <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform z-20">
                                                <Camera className="w-5 h-5 text-white" />
                                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-center text-slate-900">Edit Profile</h2>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Name</label>
                                        <input className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bio</label>
                                        <textarea className="w-full bg-slate-50 border-none rounded-xl p-4 font-medium min-h-[80px] resize-none" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Instagram</label>
                                            <input className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold" placeholder="@username" value={profile.socialLinks.instagram || ""} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">WhatsApp</label>
                                            <input className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold" placeholder="+1..." value={profile.socialLinks.whatsapp || ""} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, whatsapp: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-xl bg-black text-white font-bold text-base hover:bg-slate-800 transition-all">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile"}
                                </button>
                            </div>
                        ) : editingBlock ? (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black tracking-tight text-center text-slate-900">Edit Block</h2>
                                <div className="space-y-5">
                                    {editingBlock.type !== 'TEXT' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Title</label>
                                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 px-4 font-bold" value={editingBlock.title} onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })} />
                                        </div>
                                    )}
                                    {editingBlock.type === 'TEXT' && (
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Message</label>
                                            <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[160px] resize-none" value={textEditorContent} onChange={(e) => setTextEditorContent(e.target.value)} />
                                        </div>
                                    )}
                                    {(editingBlock.type === 'URL' || editingBlock.type === 'YOUTUBE') && (
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Link</label>
                                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 px-4 font-mono text-sm" value={editingBlock.url} onChange={(e) => setEditingBlock({ ...editingBlock, url: e.target.value })} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3 mt-8">
                                    <button onClick={confirmEditBlock} disabled={saving} className="h-14 rounded-xl bg-black text-white font-bold">
                                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Changes"}
                                    </button>
                                    <button onClick={() => { handleDelete(editingBlock.id); setEditingBlock(null); }} className="h-12 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all">Delete Block</button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

            {isProductModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setIsProductModalOpen(false); resetProductForm(); }} />
                    <div className="w-full max-w-[440px] bg-[#F8F8F8] rounded-[2.5rem] overflow-hidden shadow-2xl relative text-black max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex-1 overflow-y-auto pb-24 relative custom-scrollbar">
                            <div className="relative aspect-[4/5] bg-slate-100 group">
                                {pendingProduct.imageUrls?.[0] ? <img src={pendingProduct.imageUrls[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300"><ImageIcon className="w-16 h-16 mb-2 opacity-20" /><p className="text-xs font-bold uppercase tracking-widest opacity-40">No Image Uploaded</p></div>}
                                <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                                    <button onClick={() => { setIsProductModalOpen(false); resetProductForm(); }} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-black flex items-center justify-center shadow-lg pointer-events-auto"><ChevronLeft className="w-6 h-6" /></button>
                                    <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-black flex items-center justify-center shadow-lg pointer-events-auto"><ShoppingBag className="w-5 h-5" /></div>
                                </div>
                                <label className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                    {uploadingProductImage ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Camera className="w-5 h-5 text-black" />}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
                                </label>
                            </div>
                            <div className="bg-white rounded-t-[2.5rem] -mt-10 relative z-10 p-8 space-y-8">
                                <div>
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <div className="flex-1">
                                            <input className="w-full bg-transparent border-none p-0 text-3xl font-black text-black placeholder:text-black/10 focus:ring-0" placeholder="Product Name" value={pendingProduct.name} onChange={(e) => setPendingProduct({ ...pendingProduct, name: e.target.value })} />
                                            <p className="text-sm font-medium text-black/40 mt-1">Digital Asset • Worldwide Delivery</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Select Type</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPendingProduct({ ...pendingProduct, type: "DIGITAL" })} className={`h-14 flex-1 rounded-2xl font-bold transition-all border-2 ${pendingProduct.type === "DIGITAL" ? 'bg-black text-white border-black' : 'bg-white text-black/40 border-black/5'}`}>Digital Asset</button>
                                        <button onClick={() => setPendingProduct({ ...pendingProduct, type: "SERVICE" })} className={`h-14 flex-1 rounded-2xl font-bold transition-all border-2 ${pendingProduct.type === "SERVICE" ? 'bg-black text-white border-black' : 'bg-white text-black/40 border-black/5'}`}>Service</button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Description</h3>
                                    <textarea className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium text-black/60 min-h-[120px] resize-none focus:ring-1 focus:ring-black/5" placeholder="Tell your customers about this piece..." value={pendingProduct.description} onChange={(e) => setPendingProduct({ ...pendingProduct, description: e.target.value })} />
                                </div>
                                {pendingProduct.type === "DIGITAL" && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Digital Delivery</h3>
                                        {pendingProduct.fileUrl ? (
                                            <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-5">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center"><Check className="w-6 h-6 text-white" /></div>
                                                <div className="flex-1 min-w-0"><p className="text-sm font-black text-black">File Attached</p></div>
                                                <button onClick={() => setPendingProduct({ ...pendingProduct, fileUrl: "" })} className="text-slate-300 hover:text-red-500 p-2"><X className="w-5 h-5" /></button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 cursor-pointer hover:bg-white hover:border-black/20 transition-all group">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">{uploadingProductFile ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : <Plus className="w-6 h-6 text-black" />}</div>
                                                <div className="flex flex-col"><span className="text-sm font-black text-black">Upload digital file</span><span className="text-[11px] text-black/40 font-bold uppercase tracking-tighter">MAX 500MB</span></div>
                                                <input type="file" className="hidden" onChange={handleProductFileUpload} />
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-black/5 flex items-center gap-6 z-20">
                            <div className="flex-shrink-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1 leading-none">Price Tag</p>
                                <div className="flex items-center text-black font-black text-2xl tracking-tighter">
                                    <span className="text-sm mt-1 mr-1.5 opacity-40">$</span>
                                    <input type="number" className="w-20 bg-transparent border-none p-0 focus:ring-0 text-2xl font-black" placeholder="0.00" value={pendingProduct.price} onChange={(e) => setPendingProduct({ ...pendingProduct, price: e.target.value })} />
                                </div>
                            </div>
                            <button onClick={handleSaveProduct} disabled={saving || !pendingProduct.name || !pendingProduct.price} className="flex-1 h-16 bg-black text-white rounded-[1.5rem] font-black text-base shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProduct ? "Update Product" : "Create Product")}
                                {!saving && <ChevronRight className="w-5 h-5 opacity-40" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SocialIconPreview({ socialLinks }: { socialLinks: any }) {
    return (
        <div className="flex gap-4 items-center justify-center flex-wrap">
            {socialLinks.instagram && <img src="/socials/instagram.png" className="w-5 h-5 opacity-50" />}
            {socialLinks.x && <img src="/socials/x.png" className="w-5 h-5 opacity-50" />}
            {socialLinks.youtube && <img src="/socials/youtube.png" className="w-5 h-5 opacity-50" />}
            {socialLinks.whatsapp && <img src="/socials/whatsapp.png" className="w-5 h-5 opacity-50" />}
            {socialLinks.reddit && <img src="/socials/reddit.png" className="w-5 h-5 opacity-50" />}
            {socialLinks.email && <img src="/socials/mail.png" className="w-5 h-5 opacity-50" />}
        </div>
    );
}
