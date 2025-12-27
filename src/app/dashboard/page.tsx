"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Store,
    ExternalLink,
    User,
    Trash2,
    Type,
    Youtube,
    ImageIcon,
    Link as LinkIcon,
    Loader2,
    ChevronRight,
    LogOut,
    Edit2,
    ChevronUp,
    ChevronDown,
    Palette,
    Upload,
    Camera,
    Layout,
    Pipette,
    Share2,
    Package,
    Home,
    BarChart3,
    Settings,
    Banknote,
    Info,
    X,
    ToggleLeft,
    ToggleRight,
    PenTool,
    Copy,
    Clock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { updateStoreProfile, addStoreLink, deleteStoreLink, getStoreByUserId, updateStoreLinks, updateStoreSlug, checkSlugAvailability, addProduct, updateProduct, deleteProduct, toggleProductPublished, getProductsByStoreId } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');

    const [store, setStore] = useState<any>(null);
    const [profile, setProfile] = useState({
        name: "",
        bio: "",
        avatarUrl: "",
        bannerUrl: "",
        themeColor: "#000000",
        headerLayout: "MODERN_CARD",
        socialLinks: { instagram: "", x: "", youtube: "", facebook: "", reddit: "", whatsapp: "", email: "" }
    });
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [links, setLinks] = useState<any[]>([]);

    // Products state
    const [activeTab, setActiveTab] = useState<'store' | 'products' | 'stats' | 'settings' | 'earnings'>('store');
    const [products, setProducts] = useState<any[]>([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [uploadingProductImage, setUploadingProductImage] = useState(false);
    const [uploadingProductFile, setUploadingProductFile] = useState(false);

    // Payout state
    const [payoutDetails, setPayoutDetails] = useState({
        provider: "M-Pesa (Kenya)",
        accountName: "",
        accountNumber: ""
    });
    const [savingPayout, setSavingPayout] = useState(false);

    const [pendingProduct, setPendingProduct] = useState({
        name: "",
        description: "",
        price: "",
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
                    socialLinks: {
                        instagram: "", x: "", youtube: "", facebook: "", reddit: "", whatsapp: "", email: "",
                        ...(storeData.socialLinks as any || {})
                    }
                });
                setLinks(storeData.links || []);

                // Load products
                const productData = await getProductsByStoreId(storeData.id);
                setProducts(productData);

                // Load payout details if they exist in store (using socialLinks or similar for now or just defaults)
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

        // 1. Update Profile
        const profileRes = await updateStoreProfile(user.id, {
            name: profile.name,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            bannerUrl: profile.bannerUrl,
            themeColor: profile.themeColor,
            headerLayout: profile.headerLayout,
            socialLinks: profile.socialLinks,
            payoutDetails: payoutDetails
        });

        // 2. Update Links (content changes)
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
            setTextAlignment('left'); // Default for now
        }
        setEditingBlock(link);
    };

    const handleOpenAddModal = (type: string) => {
        if (type === 'TEXT') {
            setTextEditorContent("");
            setTextAlignment('left');
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

            // Handle Text Content from Rich Editor
            if (pendingBlock.type === 'TEXT') {
                finalUrl = textEditorContent;
                pendingBlock.title = textEditorContent.slice(0, 30);
            }

            // If it's an image and there's a file, upload it first
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

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    };

    const execCommand = (command: string, value: string = "") => {
        document.execCommand(command, false, value);
    };

    const updateBlockLocally = (id: string, field: string, value: string) => {
        setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
        setHasChanges(true);
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
                setLinks(links.map(l => l.id === editingBlock.id ? editingBlock : l));
                setEditingBlock(null);
                toast.success("Block updated!");
            }
        } catch (error) {
            toast.error("Failed to update block");
        } finally {
            setSaving(false);
        }
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newLinks = [...links];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLinks.length) return;

        [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
        setLinks(newLinks);
        setHasChanges(true); // Mark as changed
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploadingAvatar(true);
            const supabase = createClient();

            // Get current user for unique path
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`; // Upload directly to the bucket root

            // Upload the file to the "avatars" bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setProfile({ ...profile, avatarUrl: publicUrl });
            setHasChanges(true);
            toast.success("Profile picture uploaded!");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + (error.message || "Unknown error"));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const [uploadingBanner, setUploadingBanner] = useState(false);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploadingBanner(true);
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const fileExt = file.name.split('.').pop();
            const fileName = `banner-${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setProfile({ ...profile, bannerUrl: publicUrl });
            setHasChanges(true);
            toast.success("Banner uploaded!");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + (error.message || "Unknown error"));
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploadingBlockId(blockId);
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${blockId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload the file to the "products" bucket (used for general images)
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            updateBlockLocally(blockId, 'url', publicUrl);
            toast.success("Image uploaded!");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + (error.message || "Unknown error"));
        } finally {
            setUploadingBlockId(null);
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
            toast.error("Connecting to server...");
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

    // ==================== PRODUCT HANDLERS ====================

    const resetProductForm = () => {
        setPendingProduct({
            name: "",
            description: "",
            price: "",
            type: "DIGITAL",
            imageUrls: [],
            fileUrl: "",
            buttonText: "Get Started"
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
            buttonText: product.buttonText || "Get Started"
        });
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!store) {
            toast.error("Store not found. Please refresh or set your handle first.");
            return;
        }

        if (!pendingProduct.name) {
            toast.error("Please enter a product name");
            return;
        }

        if (!pendingProduct.price) {
            toast.error("Please enter a price");
            return;
        }

        setSaving(true);

        try {
            if (editingProduct) {
                // Update existing product
                const res = await updateProduct(editingProduct.id, {
                    name: pendingProduct.name,
                    description: pendingProduct.description,
                    price: parseFloat(pendingProduct.price),
                    type: pendingProduct.type,
                    imageUrls: pendingProduct.imageUrls,
                    fileUrl: pendingProduct.fileUrl,
                    buttonText: pendingProduct.buttonText
                });
                if (res.success) {
                    // Refresh products
                    const productData = await getProductsByStoreId(store.id);
                    setProducts(productData);
                    toast.success("Product updated!");
                } else {
                    toast.error(res.error || "Failed to update product");
                }
            } else {
                // Add new product
                const res = await addProduct(store.id, {
                    name: pendingProduct.name,
                    description: pendingProduct.description,
                    price: parseFloat(pendingProduct.price),
                    type: pendingProduct.type,
                    imageUrls: pendingProduct.imageUrls,
                    fileUrl: pendingProduct.fileUrl,
                    buttonText: pendingProduct.buttonText
                });
                if (res.success) {
                    // Refresh products
                    const productData = await getProductsByStoreId(store.id);
                    setProducts(productData);
                    toast.success("Product added!");
                } else {
                    toast.error(res.error || "Failed to add product");
                }
            }
            setIsProductModalOpen(false);
            resetProductForm();
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
        } else {
            toast.error("Failed to delete product");
        }
    };

    const handleTogglePublish = async (productId: string, currentStatus: boolean) => {
        const res = await toggleProductPublished(productId, !currentStatus);
        if (res.success) {
            setProducts(products.map(p => p.id === productId ? { ...p, isPublished: !currentStatus } : p));
            toast.success(currentStatus ? "Product unpublished" : "Product published!");
        } else {
            toast.error("Failed to update product");
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

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

    const removeProductImage = (index: number) => {
        setPendingProduct({
            ...pendingProduct,
            imageUrls: pendingProduct.imageUrls.filter((_, i) => i !== index)
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    const bgColor = profile.themeColor === "#000000" ? "#020617" : profile.themeColor;
    const cardBg = "rgba(15, 23, 42, 0.4)";

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 selection:bg-black selection:text-white pb-32 font-sans">

            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
                        <Store className="text-white w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight capitalize leading-none mb-0.5">{store?.slug || "No Handle"}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`font-semibold h-9 px-4 rounded-full text-xs transition-all ${!store?.slug ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-600 hover:bg-slate-100 hover:text-black'}`}
                        onClick={() => {
                            if (!store?.slug) {
                                setActiveTab('settings');
                                setIsEditingSlug(true);
                                toast.error("Please set your handle first");
                            } else {
                                window.open(`/${store.slug}`, '_blank');
                            }
                        }}
                    >
                        View Live <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition-all"
                        onClick={() => {
                            if (!store?.slug) {
                                setActiveTab('settings');
                                setIsEditingSlug(true);
                                toast.error("Please set your handle first");
                                return;
                            }
                            const url = `${window.location.origin}/${store.slug}`;
                            if (navigator.share) {
                                navigator.share({
                                    title: store.name || "My Store",
                                    url: url
                                }).catch(() => { });
                            } else {
                                navigator.clipboard.writeText(url);
                                toast.success("Link copied to clipboard!");
                            }
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>


                </div>
            </header>

            {/* Dashboard Canvas */}
            <main className={`transition-all duration-500 ${activeTab === 'store' ? 'w-full pb-0' : 'max-w-[480px] mx-auto pt-24 px-6 pb-32'}`}>

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Settings</h2>

                        {/* Account Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Account</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-slate-900 truncate">{user?.email}</p>
                                    <p className="text-xs text-slate-400 font-medium">Synced with Supabase</p>
                                </div>
                            </div>
                        </div>

                        {/* Store Handle Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Store Handle</h3>
                                {!isEditingSlug && (
                                    <button onClick={() => setIsEditingSlug(true)} className="text-[10px] font-bold text-slate-900 hover:text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full transition-colors">Change</button>
                                )}
                            </div>

                            {isEditingSlug || !store?.slug ? (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                        <input
                                            className={`w-full bg-slate-50 border-none rounded-xl h-12 pl-8 pr-4 text-base font-bold focus:ring-2 transition-all text-slate-900 ${isSlugAvailable === false ? 'ring-2 ring-red-500/20 text-red-600' : 'focus:ring-sky-500/20'}`}
                                            placeholder="handle"
                                            value={newSlug}
                                            onChange={(e) => handleSlugCheck(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                        />
                                        {isCheckingSlug ? (
                                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                                        ) : (
                                            isSlugAvailable !== null ? (
                                                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase ${isSlugAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {isSlugAvailable ? 'Available' : 'Taken'}
                                                </span>
                                            ) : (
                                                newSlug.length >= 3 && (
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-slate-400">
                                                        Checking...
                                                    </span>
                                                )
                                            )
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            disabled={!isSlugAvailable || isCheckingSlug || newSlug === store?.slug}
                                            onClick={handleSaveSlug}
                                            className="flex-1 h-12 rounded-xl bg-black text-white font-bold text-sm shadow-xl shadow-black/10 hover:bg-slate-800 active:scale-95 transition-all"
                                        >
                                            Save Handle
                                        </Button>
                                        <Button
                                            onClick={() => { setIsEditingSlug(false); setNewSlug(store?.slug || ""); }}
                                            className="h-12 w-12 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="bg-slate-50 rounded-xl p-4 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`merh.app/${store?.slug}`);
                                        toast.success("Link copied!");
                                    }}
                                >
                                    <p className="text-lg font-black text-slate-900 flex items-center gap-0.5">
                                        <span className="text-slate-400 font-medium">@</span>{store?.slug}
                                    </p>
                                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                </div>
                            )}
                        </div>

                        {/* Sign Out Button */}
                        <Button
                            variant="ghost"
                            className="w-full justify-center h-14 rounded-3xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all border border-red-100 bg-white shadow-sm hover:shadow-md hover:border-red-200"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="font-bold text-base">Log out</span>
                        </Button>

                        <p className="text-center text-xs text-slate-300 font-bold pt-6">
                            Merh App v1.0.0
                        </p>
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">Products</h2>
                            <Button
                                onClick={handleOpenAddProduct}
                                className="bg-black hover:bg-slate-800 text-white font-bold text-sm h-10 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="text-lg font-bold text-slate-900">No products yet</p>
                                <p className="text-sm text-slate-500 mt-1">Add your first product to start selling</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm p-5 transition-all hover:shadow-lg hover:border-slate-200"
                                    >
                                        <div className="flex gap-5">
                                            {/* Product Image */}
                                            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm relative group-hover:scale-[1.02] transition-transform">
                                                {product.imageUrls?.[0] ? (
                                                    <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex items-start justify-between gap-4 mb-1">
                                                    <h3 className="font-black text-slate-900 truncate text-xl tracking-tight">{product.name}</h3>
                                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                        <span className="text-slate-900 font-black text-sm whitespace-nowrap">
                                                            ${parseFloat(product.price || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed opacity-80">{product.description || "No description provided."}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons - Full Width Footer */}
                                        <div className="flex items-center justify-between mt-5 w-full">
                                            {/* Share Button - Large Pill Style */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const identifier = product.slug || product.id;
                                                    const url = `${window.location.origin}/${store?.slug}/${identifier}`;
                                                    navigator.clipboard.writeText(url);
                                                    toast.success("Product link copied!");
                                                }}
                                                className="flex items-center gap-2.5 h-10 px-6 rounded-full font-bold text-sm bg-slate-50 text-slate-900 border border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                                            >
                                                <Share2 className="w-4 h-4" />
                                                <span>Copy Link</span>
                                            </button>

                                            <div className="flex items-center gap-5 pr-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEditProduct(product); }}
                                                    className="font-bold text-sm text-slate-400 hover:text-slate-900 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                                    className="font-bold text-sm text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STORE TAB (Exact Preview Mode) */}
                {activeTab === 'store' && (
                    <div className="min-h-screen w-full flex flex-col items-center pt-20 pb-32 px-4 transition-colors duration-500"
                        style={{
                            backgroundColor: profile.themeColor === "#000000" ? "#020617" : (profile.themeColor || "#000000"),
                            color: "#ffffff"
                        }}
                    >
                        {/* Theme Constants Helper */}
                        {(() => {
                            const themeColor = profile.themeColor || "#000000";
                            const isDark = themeColor === "#000000";
                            const cardBg = "rgba(15, 23, 42, 0.4)";
                            const buttonBg = "#ffffff";
                            const buttonText = isDark ? "#020617" : themeColor;

                            return (
                                <>
                                    {/* Edit Hint */}
                                    <div className="fixed top-28 right-4 z-40">
                                        <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-2">
                                            <PenTool className="w-3 h-3" />
                                            Tap items to edit
                                        </div>
                                    </div>

                                    {/* Profile Header Preview */}
                                    <div
                                        onClick={() => setIsEditingProfile(true)}
                                        className="w-full max-w-[400px] cursor-pointer relative group"
                                    >
                                        <div className="absolute inset-0 z-20 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl backdrop-blur-[2px]">
                                            <span className="font-bold text-white bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md">Edit Profile</span>
                                        </div>

                                        {(() => {
                                            const layout = profile.headerLayout || 'MODERN_CARD';
                                            const bannerUrl = profile.bannerUrl;

                                            if (layout === 'PROFILE_BANNER') {
                                                return (
                                                    <div className="mb-10 text-center relative pointer-events-none">
                                                        <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-[-50px]">
                                                            {bannerUrl ? <img src={bannerUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
                                                        </div>
                                                        <div className={`w-24 h-24 rounded-full mx-auto relative z-10 overflow-hidden border-4 shadow-2xl ${isDark ? 'bg-gray-800 border-[#020617]' : 'bg-white border-' + themeColor}`}>
                                                            {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#1e293b]"><User className="w-10 h-10 opacity-20" /></div>}
                                                        </div>
                                                        <div className="mt-4">
                                                            <h1 className="text-3xl font-black mb-1 tracking-tight">{profile.name || "Your Name"}</h1>
                                                            <p className="text-sm font-medium opacity-70 max-w-[300px] mx-auto leading-relaxed">{profile.bio || "Add a bio..."}</p>
                                                            <div className="flex gap-4 justify-center mt-6 flex-wrap"><SocialIconPreview socialLinks={profile.socialLinks} /></div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            if (layout === 'MINIMAL_TOP') {
                                                return (
                                                    <div className="mb-12 flex flex-col items-center text-center pointer-events-none">
                                                        <div className={`w-20 h-20 rounded-full mb-6 overflow-hidden border-2 shadow-xl ${isDark ? 'bg-gray-800 border-white/5' : 'bg-white/20 border-white/20'}`}>
                                                            {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-10 h-10 opacity-20 mx-auto mt-5" />}
                                                        </div>
                                                        <h1 className="text-4xl font-black mb-3 tracking-tighter">{profile.name || "Your Name"}</h1>
                                                        <p className="text-base font-medium opacity-60 max-w-[320px] leading-relaxed mb-6">{profile.bio || "Add a bio..."}</p>
                                                        <div className="flex gap-6 justify-center flex-wrap"><SocialIconPreview socialLinks={profile.socialLinks} /></div>
                                                    </div>
                                                );
                                            }
                                            if (layout === 'FULL_HERO') {
                                                return (
                                                    <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative aspect-[4/5] flex flex-col justify-end p-8 pointer-events-none">
                                                        {bannerUrl && (
                                                            <div className="absolute inset-0 z-0">
                                                                <img src={bannerUrl} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                                            </div>
                                                        )}
                                                        <div className="relative z-10 text-left">
                                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl mb-4">
                                                                {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-8 h-8 opacity-20 mx-auto mt-4" />}
                                                            </div>
                                                            <h1 className="text-4xl font-black text-white mb-2 leading-none">{profile.name || "Your Name"}</h1>
                                                            <p className="text-sm font-medium text-white/70 max-w-[280px] leading-relaxed mb-6">{profile.bio || "Add a bio..."}</p>
                                                            <div className="flex gap-4 flex-wrap"><SocialIconPreview socialLinks={profile.socialLinks} /></div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="text-center mb-10 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md pointer-events-none" style={{ backgroundColor: cardBg }}>
                                                    <div className={`w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden border-2 shadow-2xl ${isDark ? 'bg-gray-800 border-white/5' : 'bg-white/20 border-white/20'}`}>
                                                        {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-12 h-12 opacity-20" /></div>}
                                                    </div>
                                                    <h1 className="text-3xl font-black mb-2 tracking-tight">{profile.name || "Your Name"}</h1>
                                                    <p className="text-sm font-medium leading-relaxed max-w-[280px] mx-auto opacity-70">{profile.bio || "Add a bio..."}</p>
                                                    <div className="flex gap-5 justify-center mt-8 px-4 flex-wrap"><SocialIconPreview socialLinks={profile.socialLinks} /></div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Content Blocks Preview */}
                                    <div className="w-full max-w-[400px] space-y-4">
                                        {links.length === 0 && (
                                            <div className="text-center py-24 rounded-2xl border-2 border-dashed border-white/20" style={{ backgroundColor: cardBg }}>
                                                <p className="text-white/60 text-sm font-medium italic">Your canvas is empty</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-2">Add your first block below</p>
                                            </div>
                                        )}
                                        {links.map((block: any) => (
                                            <div
                                                key={block.id}
                                                onClick={() => handleOpenEditModal(block)}
                                                className="relative group cursor-pointer"
                                            >
                                                <div className="absolute inset-0 z-20 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                                                    <span className="font-bold text-white bg-white/20 px-3 py-1 text-xs rounded-full border border-white/30 backdrop-blur-md">Edit Block</span>
                                                </div>

                                                <div className="pointer-events-none">
                                                    {block.type === 'HEADING' && (
                                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-center pt-8 pb-2 opacity-40">{block.title}</h3>
                                                    )}
                                                    {block.type === 'TEXT' && (
                                                        <div className="rounded-xl p-8 shadow-lg backdrop-blur-sm border border-white/10" style={{ backgroundColor: cardBg }}>
                                                            {block.createdAt && <span className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">{new Date(block.createdAt).toLocaleDateString()}</span>}
                                                            <div className="text-sm font-medium leading-relaxed opacity-90 whitespace-pre-wrap">{block.url}</div>
                                                        </div>
                                                    )}
                                                    {block.type === 'IMAGE' && (
                                                        <div className={`rounded-xl overflow-hidden shadow-xl backdrop-blur-sm border border-white/10`} style={{ backgroundColor: cardBg }}>
                                                            {block.url ? <img src={block.url} className="w-full h-auto block" /> : <div className="w-full aspect-square flex items-center justify-center bg-white/5"><ImageIcon className="w-12 h-12 opacity-10" /></div>}
                                                            {block.title && <div className="p-5 text-center border-t border-white/5" style={{ backgroundColor: cardBg }}><p className="text-sm font-bold opacity-90">{block.title}</p></div>}
                                                        </div>
                                                    )}
                                                    {block.type === 'YOUTUBE' && (
                                                        <div className="rounded-xl overflow-hidden shadow-2xl relative aspect-video bg-black border border-white/10 flex items-center justify-center">
                                                            <Youtube className="w-12 h-12 text-white opacity-50" />
                                                        </div>
                                                    )}
                                                    {(block.type === 'URL' || !block.type) && (
                                                        <div className="flex flex-col gap-2">
                                                            <div className={`block w-full rounded-lg py-6 text-center text-lg font-bold shadow-xl border border-white/10`} style={{ backgroundColor: buttonBg, color: buttonText }}>
                                                                {block.title}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Products Preview (Read-Only) */}
                                        {products.length > 0 && (
                                            <div className="mt-8 pt-4 border-t border-white/10">
                                                <h2 className="text-lg font-black tracking-tight opacity-80 px-1 mb-4 text-center">Products</h2>
                                                <div className="grid grid-cols-1 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                                                    {products.map((product: any) => (
                                                        <div key={product.id} className="rounded-xl overflow-hidden shadow-xl backdrop-blur-md border border-white/10 flex gap-4 p-4" style={{ backgroundColor: cardBg }}>
                                                            {product.imageUrls?.[0] && <img src={product.imageUrls[0]} className="w-16 h-16 rounded-lg object-cover" />}
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-sm">{product.name}</h3>
                                                                <p className="text-xs opacity-60 mt-1">${parseFloat(product.price || 0).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* EARNINGS TAB */}
                {activeTab === 'earnings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Earnings</h2>
                            <p className="text-sm text-slate-500 font-medium">Manage your payouts and view history.</p>
                        </div>

                        {/* Balance Card */}
                        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-sky-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-sky-200 font-bold text-[10px] uppercase tracking-widest mb-2">Total Revenue</p>
                                <h3 className="text-4xl font-black tracking-tighter mb-4">$0.00</h3>
                                <div className="flex gap-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2.5 flex-1 border border-white/10">
                                        <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mb-1">Last Payout</p>
                                        <p className="font-bold text-base">$0.00</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2.5 flex-1 border border-white/10">
                                        <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mb-1">Pending</p>
                                        <p className="font-bold text-base">$0.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payout Settings Card */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Banknote className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Payout Details</h3>
                                    <p className="text-xs text-slate-400 font-medium">Where should we send your money?</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bank / Mobile Money Provider</label>
                                    <select
                                        value={payoutDetails.provider}
                                        onChange={(e) => setPayoutDetails({ ...payoutDetails, provider: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 hover:bg-slate-100 appearance-none"
                                    >
                                        <option>M-Pesa (Kenya)</option>
                                        <option>Airtel Money</option>
                                        <option>Bank Transfer (Local)</option>
                                        <option>PayPal</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Name</label>
                                    <input
                                        className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                        placeholder="e.g. Keith Katale"
                                        value={payoutDetails.accountName}
                                        onChange={(e) => setPayoutDetails({ ...payoutDetails, accountName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone / Account Number</label>
                                    <input
                                        className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                        placeholder="e.g. 0712345678"
                                        value={payoutDetails.accountNumber}
                                        onChange={(e) => setPayoutDetails({ ...payoutDetails, accountNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={async () => {
                                    setSavingPayout(true);
                                    const { data: { user } } = await createClient().auth.getUser();
                                    if (user) {
                                        const res = await updateStoreProfile(user.id, { payoutDetails });
                                        if (res.success) {
                                            toast.success("Payout details saved!");
                                            setHasChanges(false);
                                        } else {
                                            toast.error("Failed to save payout details");
                                        }
                                    }
                                    setSavingPayout(false);
                                }}
                                disabled={savingPayout}
                                className="w-full h-12 rounded-xl bg-black text-white font-bold hover:bg-slate-800 shadow-lg shadow-black/10 transition-all"
                            >
                                {savingPayout ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Payout Details"}
                            </Button>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2.5 underline-offset-4">
                                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                    <strong>Automatic Withdrawals:</strong> For simplicity, payments are automatically split. Your share is sent directly to this account immediately after each sale, minus the platform fee. No manual withdrawal needed!
                                </p>
                            </div>
                        </div>

                        {/* Recent Transactions Placeholder */}
                        <div>
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Recent Transactions</h3>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-10 text-center">
                                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-base font-bold text-slate-900">No activity yet</p>
                                    <p className="text-sm text-slate-400 mt-1 font-medium">Your sales history will appear here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main >

            {/* Floating Tool Bar */}
            < div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 px-4 w-full max-w-[450px]" >
                <div className="flex-1">
                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-14 rounded-full bg-black text-white font-bold text-lg shadow-xl shadow-black/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Changes"}
                        </Button>
                    )}
                </div>

                <div className="relative group/plus">
                    <Button
                        onClick={() => {
                            if (isColorPickerOpen || isHeaderMenuOpen) {
                                setIsColorPickerOpen(false);
                                setIsHeaderMenuOpen(false);
                            } else {
                                setIsAddMenuOpen(!isAddMenuOpen);
                            }
                        }}
                        className={`h-14 w-14 rounded-full font-black shadow-xl transition-all border ${isAddMenuOpen ? 'bg-white text-black border-slate-200 rotate-45' : 'bg-black text-white border-transparent hover:scale-110 active:scale-90'}`}
                    >
                        <Plus className="w-6 h-6" strokeWidth={3} />
                    </Button>

                    {/* Popover Menu */}
                    {isAddMenuOpen && (
                        <div className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl p-2 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 overflow-hidden z-50 ring-1 ring-black/5">
                            {!isColorPickerOpen && !isHeaderMenuOpen ? (
                                <div className="grid grid-cols-1 gap-0.5">
                                    <button onClick={() => handleOpenAddModal('TEXT')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Type className="w-5 h-5 text-sky-500" />
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Add Text</span>
                                    </button>
                                    <button onClick={() => handleOpenAddModal('YOUTUBE')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Youtube className="w-5 h-5 text-red-500" />
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Video URL</span>
                                    </button>
                                    <button onClick={() => handleOpenAddModal('URL')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <LinkIcon className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Button Link</span>
                                    </button>
                                    <button onClick={() => handleOpenAddModal('IMAGE')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <ImageIcon className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Photo</span>
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button onClick={() => setIsColorPickerOpen(true)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Palette className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Theme</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-slate-500">{profile.themeColor}</span>
                                        </div>
                                    </button>
                                    <button onClick={() => setIsHeaderMenuOpen(true)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Layout className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">Header Style</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-slate-500">Change Layout</span>
                                        </div>
                                    </button>
                                </div>
                            ) : isColorPickerOpen ? (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 p-2">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Theme</span>
                                        <button onClick={() => setIsColorPickerOpen(false)} className="text-[10px] font-bold text-slate-900 hover:underline">Back</button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {["#000000", "#1e293b", "#0c4a6e", "#1e1b4b", "#4c1d95", "#701a75", "#831843", "#450a0a"].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    setProfile({ ...profile, themeColor: color });
                                                    setHasChanges(true);
                                                }}
                                                className={`w-full aspect-square rounded-full border-2 transition-all shadow-sm ${profile.themeColor === color ? 'border-sky-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => colorInputRef.current?.click()}
                                        className="w-full h-10 rounded-lg bg-slate-50 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors"
                                    >
                                        Custom Color
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 p-2">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Header Design</span>
                                        <button onClick={() => setIsHeaderMenuOpen(false)} className="text-[10px] font-bold text-slate-900 hover:underline">Back</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
                                        {[
                                            { id: 'MODERN_CARD', label: 'Classic Card', desc: 'Centered profile card' },
                                            { id: 'PROFILE_BANNER', label: 'Banner Overlay', desc: 'Large banner with avatar' },
                                            { id: 'MINIMAL_TOP', label: 'Minimal', desc: 'Clean top alignment' },
                                            { id: 'FULL_HERO', label: 'Full Hero', desc: 'Cinematic background' }
                                        ].map((layout) => (
                                            <button
                                                key={layout.id}
                                                onClick={() => {
                                                    setProfile({ ...profile, headerLayout: layout.id });
                                                    setHasChanges(true);
                                                }}
                                                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${profile.headerLayout === layout.id
                                                    ? 'border-sky-500 bg-sky-50'
                                                    : 'border-slate-100 bg-white hover:bg-slate-50'
                                                    }`}
                                            >
                                                <p className={`text-xs font-bold ${profile.headerLayout === layout.id ? 'text-sky-700' : 'text-slate-900'}`}>{layout.label}</p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{layout.desc}</p>
                                            </button>
                                        ))}
                                    </div>

                                    {(profile.headerLayout === 'PROFILE_BANNER' || profile.headerLayout === 'FULL_HERO') && (
                                        <div className="space-y-1 mt-2">
                                            <div className="relative h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 group">
                                                {profile.bannerUrl ? (
                                                    <img src={profile.bannerUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                                        <ImageIcon className="w-4 h-4 text-slate-400 mb-1" />
                                                        <span className="text-[9px] text-slate-400 font-medium">Upload Banner</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                {uploadingBanner && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <input
                    type="color"
                    ref={colorInputRef}
                    className="hidden"
                    value={profile.themeColor}
                    onChange={(e) => {
                        setProfile({ ...profile, themeColor: e.target.value });
                        setHasChanges(true);
                    }}
                />
            </div >

            {/* Creation Modal */}
            {
                pendingBlock && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative text-slate-900 ring-1 ring-black/5">
                            {pendingBlock.type !== 'TEXT' && (
                                <div className="text-center space-y-2 mb-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                        {pendingBlock.type === 'YOUTUBE' && <Youtube className="w-8 h-8 text-red-500" />}
                                        {pendingBlock.type === 'IMAGE' && <ImageIcon className="w-8 h-8 text-purple-500" />}
                                        {pendingBlock.type === 'URL' && <LinkIcon className="w-8 h-8 text-emerald-500" />}
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Add New Block</h2>
                                    <p className="text-sm text-slate-500 font-medium">Fill in the details below</p>
                                </div>
                            )}

                            <div className="space-y-5 mt-4">
                                {pendingBlock.type !== 'TEXT' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Title / Label <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl h-14 px-4 font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-white"
                                            placeholder="Enter Label"
                                            value={pendingBlock.title}
                                            onChange={(e) => setPendingBlock({ ...pendingBlock, title: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {pendingBlock.type === 'TEXT' && (
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Message Content <span className="text-red-500">*</span></label>
                                        <textarea
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 min-h-[160px] resize-none placeholder:text-slate-400 hover:bg-white text-lg leading-relaxed"
                                            placeholder="Type your message here..."
                                            value={textEditorContent}
                                            onChange={(e) => {
                                                setTextEditorContent(e.target.value);
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {pendingBlock.type === 'IMAGE' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Image</label>
                                        <div className="relative min-h-[160px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group hover:border-sky-500/50 hover:bg-sky-50/50 transition-all cursor-pointer">
                                            {pendingBlock.file ? (
                                                <img src={URL.createObjectURL(pendingBlock.file)} className="w-full h-auto block" />
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <Upload className="w-5 h-5 text-sky-500" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-sky-600">Click to upload</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setPendingBlock({ ...pendingBlock, file });
                                            }} />
                                        </div>
                                    </div>
                                ) : (pendingBlock.type === 'URL' || pendingBlock.type === 'YOUTUBE') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{pendingBlock.type === 'YOUTUBE' ? 'YouTube Link' : 'Website URL'}</label>
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl h-14 px-4 font-mono text-sm text-sky-600 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 hover:bg-white font-medium"
                                            placeholder="https://..."
                                            value={pendingBlock.url}
                                            onChange={(e) => setPendingBlock({ ...pendingBlock, url: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-8">
                                <button
                                    onClick={confirmAddBlock}
                                    disabled={isCreating || (pendingBlock.type === 'TEXT' ? !textEditorContent : !pendingBlock.title) || (pendingBlock.type === 'IMAGE' && !pendingBlock.file)}
                                    className="h-14 rounded-xl bg-black text-white font-bold text-base hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10"
                                >
                                    {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Block"}
                                </button>
                                <button
                                    onClick={() => setPendingBlock(null)}
                                    className="h-12 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Modals */}
            {
                (editingBlock || isEditingProfile) && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative text-slate-900 ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
                            <button
                                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors group"
                                onClick={() => { setEditingBlock(null); setIsEditingProfile(false); }}
                            >
                                <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600 rotate-45 transition-colors" />
                            </button>

                            {isEditingProfile ? (
                                <div className="space-y-6">
                                    <div className="text-center space-y-3">
                                        <div className="flex items-center justify-center gap-6">
                                            {/* Avatar Upload */}
                                            <div className="relative w-24 h-24 group/avatar">
                                                <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-slate-100">
                                                    {profile.avatarUrl ? (
                                                        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                            <User className="w-8 h-8 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                {uploadingAvatar ? (
                                                    <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-20">
                                                        <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                                                    </div>
                                                ) : (
                                                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform z-20">
                                                        <Camera className="w-4 h-4 text-white" />
                                                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                                    </label>
                                                )}
                                            </div>

                                            {/* Banner Upload */}
                                            <div className="relative w-24 h-24 group/banner">
                                                <div className="w-full h-full rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-slate-100">
                                                    {profile.bannerUrl ? (
                                                        <img src={profile.bannerUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                            <ImageIcon className="w-8 h-8 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                {uploadingBanner ? (
                                                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-20">
                                                        <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                                                    </div>
                                                ) : (
                                                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform z-20">
                                                        <Camera className="w-4 h-4 text-white" />
                                                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-black tracking-tight text-slate-900">Edit Profile</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Name</label>
                                            <input
                                                className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bio</label>
                                            <textarea
                                                className="w-full bg-slate-50 border-none rounded-xl p-4 font-medium focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 min-h-[80px] resize-none placeholder:text-slate-400 hover:bg-slate-100"
                                                value={profile.bio}
                                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Instagram</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                                    placeholder="@username"
                                                    value={profile.socialLinks.instagram || ""}
                                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">X (Twitter)</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                                    placeholder="@username"
                                                    value={profile.socialLinks.x || ""}
                                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, x: e.target.value } })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">YouTube</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                                    placeholder="@channel"
                                                    value={profile.socialLinks.youtube || ""}
                                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, youtube: e.target.value } })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">WhatsApp</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                                    placeholder="+1..."
                                                    value={profile.socialLinks.whatsapp || ""}
                                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, whatsapp: e.target.value } })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reddit</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                                    placeholder="u/username"
                                                    value={profile.socialLinks.reddit || ""}
                                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, reddit: e.target.value } })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl h-10 px-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                                    placeholder="hello@..."
                                                    value={profile.socialLinks.email || ""}
                                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, email: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="w-full h-14 rounded-xl bg-black text-white font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-black/10"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile"}
                                        </button>
                                    </div>
                                </div>
                            ) : editingBlock && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2 mb-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                            {editingBlock.type === 'TEXT' && <Type className="w-8 h-8 text-sky-500" />}
                                            {editingBlock.type === 'IMAGE' && <ImageIcon className="w-8 h-8 text-purple-500" />}
                                            {editingBlock.type === 'URL' && <LinkIcon className="w-8 h-8 text-emerald-500" />}
                                            {editingBlock.type === 'YOUTUBE' && <Youtube className="w-8 h-8 text-red-500" />}
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight text-center text-slate-900">Edit Block</h2>
                                    </div>

                                    <div className="space-y-5">
                                        {editingBlock.type !== 'TEXT' && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Title</label>
                                                <input
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 px-4 font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 placeholder:text-slate-400"
                                                    value={editingBlock.title}
                                                    onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        {editingBlock.type === 'TEXT' && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Message Content</label>
                                                <textarea
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 min-h-[160px] resize-none placeholder:text-slate-400 text-lg leading-relaxed"
                                                    value={textEditorContent}
                                                    onChange={(e) => {
                                                        setTextEditorContent(e.target.value);
                                                        setEditingBlock({ ...editingBlock, title: e.target.value.slice(0, 30) });
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {editingBlock.type === 'IMAGE' ? (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Image</label>
                                                <div className="relative rounded-xl bg-slate-50 overflow-hidden group border border-slate-200 hover:border-sky-500/30 transition-all">
                                                    {uploadingBlockId === editingBlock.id ? (
                                                        <div className="h-48 flex items-center justify-center">
                                                            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <img src={editingBlock.url} className="w-full h-auto block transition-all group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                                                    <Camera className="w-4 h-4 text-slate-900" />
                                                                    <span className="text-xs font-bold text-slate-900">Change Image</span>
                                                                </div>
                                                            </div>
                                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleBlockImageUpload(e, editingBlock.id)} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (editingBlock.type === 'URL' || editingBlock.type === 'YOUTUBE') && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{editingBlock.type === 'YOUTUBE' ? 'YouTube Link' : 'Website URL'}</label>
                                                <input
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 px-4 font-mono text-sm text-sky-600 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium placeholder:text-slate-400"
                                                    value={editingBlock.url}
                                                    onChange={(e) => setEditingBlock({ ...editingBlock, url: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 mt-8">
                                        <button
                                            onClick={confirmEditBlock}
                                            disabled={saving}
                                            className="h-14 rounded-xl bg-black text-white font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-black/10"
                                        >
                                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={() => { handleDelete(editingBlock.id); setEditingBlock(null); }}
                                            className="h-12 rounded-xl font-bold text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            Delete Block
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 safe-area-bottom">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex flex-col items-center gap-1 w-[60px] py-2 rounded-lg transition-all ${activeTab === 'products' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Package className="w-5 h-5" strokeWidth={activeTab === 'products' ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-wide">Products</span>
                </button>

                <button
                    onClick={() => toast.info("Stats coming soon!")}
                    className="flex flex-col items-center gap-1 w-[60px] py-2 rounded-lg text-slate-300 hover:text-slate-400 transition-colors"
                >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-wide">Stats</span>
                </button>

                {/* Center Store Button */}
                <button
                    onClick={() => setActiveTab('store')}
                    className={`flex flex-col items-center justify-center gap-1 w-[72px] h-[72px] -mt-5 rounded-2xl border-4 transition-all shadow-lg ${activeTab === 'store'
                        ? 'bg-white border-sky-100 text-slate-900 shadow-sky-100/50'
                        : 'bg-white border-slate-50 text-slate-400 hover:text-slate-600 hover:border-slate-100'
                        }`}
                >
                    <Home className="w-6 h-6" strokeWidth={activeTab === 'store' ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-wide">Store</span>
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex flex-col items-center gap-1 w-[60px] py-2 rounded-lg transition-all ${activeTab === 'settings' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Settings className="w-5 h-5" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-wide">Settings</span>
                </button>

                <button
                    onClick={() => setActiveTab('earnings')}
                    className={`flex flex-col items-center gap-1 w-[60px] py-2 rounded-lg transition-all ${activeTab === 'earnings' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Banknote className="w-5 h-5" strokeWidth={activeTab === 'earnings' ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-wide">Earnings</span>
                </button>
            </nav>

            {/* Add/Edit Product Modal */}
            {
                isProductModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={() => { setIsProductModalOpen(false); resetProductForm(); }} />
                        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto mx-4 animate-in fade-in slide-in-from-bottom-8 ring-1 ring-black/5">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black tracking-tight text-slate-900">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                                <button onClick={() => { setIsProductModalOpen(false); resetProductForm(); }} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Product Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product Name *</label>
                                    <input
                                        className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                        placeholder="e.g. Design Template Pack"
                                        value={pendingProduct.name}
                                        onChange={(e) => setPendingProduct({ ...pendingProduct, name: e.target.value })}
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 font-medium focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 min-h-[100px] resize-none placeholder:text-slate-400 hover:bg-slate-100"
                                        placeholder="Describe your product..."
                                        value={pendingProduct.description}
                                        onChange={(e) => setPendingProduct({ ...pendingProduct, description: e.target.value })}
                                    />
                                </div>

                                {/* Price */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Price (USD) *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full bg-slate-50 border-none rounded-xl h-12 pl-8 pr-4 font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                            placeholder="29.99"
                                            value={pendingProduct.price}
                                            onChange={(e) => setPendingProduct({ ...pendingProduct, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Product Type */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPendingProduct({ ...pendingProduct, type: "DIGITAL" })}
                                            className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all border-2 ${pendingProduct.type === "DIGITAL" ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                                        >
                                            Digital
                                        </button>
                                        <button
                                            onClick={() => setPendingProduct({ ...pendingProduct, type: "SERVICE" })}
                                            className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all border-2 ${pendingProduct.type === "SERVICE" ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                                        >
                                            Service
                                        </button>
                                    </div>
                                </div>

                                {/* Product Images */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product Images</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {pendingProduct.imageUrls.map((url, i) => (
                                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-slate-100 group">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeProductImage(i)}
                                                    className="absolute top-1 right-1 p-1 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-sky-500/50 transition-all group">
                                            {uploadingProductImage ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <Plus className="w-6 h-6 text-slate-400 group-hover:text-sky-500 transition-colors" />}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
                                        </label>
                                    </div>
                                </div>

                                {/* Digital File (for digital products) */}
                                {pendingProduct.type === "DIGITAL" && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Digital File</label>
                                        <div>
                                            {pendingProduct.fileUrl ? (
                                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 group">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-emerald-700 truncate">File Uploaded</p>
                                                        <p className="text-[10px] font-medium text-emerald-600/70">Ready for download</p>
                                                    </div>
                                                    <button onClick={() => setPendingProduct({ ...pendingProduct, fileUrl: "" })} className="text-emerald-400 hover:text-emerald-600 p-2">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 cursor-pointer hover:bg-white hover:border-sky-200 hover:shadow-md transition-all group">
                                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        {uploadingProductFile ? <Loader2 className="w-5 h-5 animate-spin text-sky-500" /> : <Upload className="w-5 h-5 text-sky-500" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700">Upload Product File</span>
                                                        <span className="text-[11px] text-slate-400 font-medium">PDF, ZIP, etc.</span>
                                                    </div>
                                                    <input type="file" className="hidden" onChange={handleProductFileUpload} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Button Text */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Button Text</label>
                                    <input
                                        className="w-full bg-slate-50 border-none rounded-xl h-12 px-4 font-bold focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400 hover:bg-slate-100"
                                        placeholder="Get Started"
                                        value={pendingProduct.buttonText}
                                        onChange={(e) => setPendingProduct({ ...pendingProduct, buttonText: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 mt-8">
                                <button
                                    onClick={handleSaveProduct}
                                    disabled={saving}
                                    className="h-14 rounded-xl bg-black text-white font-bold text-base hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-black/10"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProduct ? "Save Changes" : "Add Product")}
                                </button>
                                <button
                                    onClick={() => { setIsProductModalOpen(false); resetProductForm(); }}
                                    className="h-12 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
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
