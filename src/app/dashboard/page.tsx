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
    Share2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { updateStoreProfile, addStoreLink, deleteStoreLink, getStoreByUserId, updateStoreLinks, updateStoreSlug, checkSlugAvailability } from "@/app/actions";
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
    const [isAccountOpen, setIsAccountOpen] = useState(false);
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
            socialLinks: profile.socialLinks
        });

        // 2. Update Links (content changes)
        const linksRes = await updateStoreLinks(links.map((l, i) => ({
            id: l.id,
            title: l.title,
            url: l.url,
            order: i
        })));

        if (profileRes.success && linksRes.success) {
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
        <div className="min-h-screen text-white selection:bg-sky-400 selection:text-white pb-32 font-sans transition-all duration-700" style={{ backgroundColor: bgColor }}>

            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-40 backdrop-blur-xl border-b border-white/5 transition-all duration-700" style={{ backgroundColor: `${bgColor}cc` }}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <Store className="text-white w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm tracking-tight capitalize leading-none mb-1">{store?.slug || "No Handle"}</span>
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`font-bold h-10 px-5 rounded-lg transition-all ${!store?.slug ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20' : 'hover:bg-white/5'}`}
                        onClick={() => {
                            if (!store?.slug) {
                                setIsAccountOpen(true);
                                setIsEditingSlug(true);
                                toast.error("Please set your handle first");
                            } else {
                                window.open(`/${store.slug}`, '_blank');
                            }
                        }}
                    >
                        View Live <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-all"
                        onClick={() => {
                            if (!store?.slug) {
                                setIsAccountOpen(true);
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

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-11 w-11 rounded-lg transition-all ${isAccountOpen ? 'bg-white text-black' : (store?.slug ? 'text-slate-400 hover:text-white bg-white/5' : 'bg-red-500 text-white animate-pulse')} relative`}
                            onClick={() => setIsAccountOpen(!isAccountOpen)}
                        >
                            <User className="w-5 h-5" />
                            {!store?.slug && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#020617]" />}
                        </Button>

                        {isAccountOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsAccountOpen(false)} />
                                <div className="absolute top-14 right-0 w-80 bg-[#0f172a] rounded-2xl p-8 shadow-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 z-50">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account</p>
                                            <p className="text-sm font-bold truncate text-white">{user?.email}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Store Handle</p>
                                                {!isEditingSlug && (
                                                    <button onClick={() => setIsEditingSlug(true)} className="text-[10px] font-bold text-sky-400 hover:underline">Change</button>
                                                )}
                                            </div>

                                            {isEditingSlug || !store?.slug ? (
                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                                                        <input
                                                            className={`w-full bg-[#1e293b] border-none rounded-lg h-12 pl-8 pr-4 text-sm font-bold focus:ring-2 transition-all text-white ${isSlugAvailable === false ? 'ring-2 ring-red-500' : 'focus:ring-sky-500'}`}
                                                            placeholder="handle"
                                                            value={newSlug}
                                                            onChange={(e) => handleSlugCheck(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                                        />
                                                        {isCheckingSlug ? (
                                                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-600" />
                                                        ) : (
                                                            isSlugAvailable !== null ? (
                                                                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase ${isSlugAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                    {isSlugAvailable ? 'Available' : 'Taken'}
                                                                </span>
                                                            ) : (
                                                                newSlug.length >= 3 && (
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-600">
                                                                        Checking...
                                                                    </span>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                    <Button
                                                        disabled={!isSlugAvailable || isCheckingSlug || newSlug === store?.slug}
                                                        onClick={handleSaveSlug}
                                                        className="w-full h-12 rounded-lg bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
                                                    >
                                                        Save Handle
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-bold text-white truncate flex items-center gap-2">
                                                    @{store?.slug}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-white/5 mt-4">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start h-14 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/5 px-4 transition-all"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="w-5 h-5 mr-3" />
                                                <span className="font-bold">Log out</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Dashboard Canvas */}
            <main className="max-w-[440px] mx-auto pt-32 px-6">

                {/* Profile Card Preview */}
                {(() => {
                    const layout = profile.headerLayout || 'MODERN_CARD';

                    if (layout === 'PROFILE_BANNER') {
                        return (
                            <div
                                onClick={() => setIsEditingProfile(true)}
                                className="group w-full mb-10 text-center relative cursor-pointer"
                            >
                                <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-[-50px]">
                                    {profile.bannerUrl ? (
                                        <img src={profile.bannerUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5" />
                                    )}
                                </div>
                                <div className="w-24 h-24 rounded-full mx-auto relative z-10 overflow-hidden border-4 border-[#020617] shadow-2xl bg-gray-800 transition-transform group-hover:scale-105">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1e293b]">
                                            <User className="w-10 h-10 opacity-20" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <h1 className="text-3xl font-black mb-1 tracking-tight">{profile.name || "Set Name"}</h1>
                                    <p className="text-sm font-medium opacity-70 max-w-[300px] mx-auto leading-relaxed">{profile.bio || "Write your bio..."}</p>
                                    <div className="flex gap-4 justify-center mt-6 flex-wrap">
                                        <SocialIconPreview socialLinks={profile.socialLinks} />
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 className="w-4 h-4" />
                                </div>
                            </div>
                        );
                    }

                    if (layout === 'MINIMAL_TOP') {
                        return (
                            <div
                                onClick={() => setIsEditingProfile(true)}
                                className="group w-full mb-12 flex flex-col items-center text-center cursor-pointer"
                            >
                                <div className="w-20 h-20 rounded-full mb-6 overflow-hidden border-2 border-white/5 shadow-xl bg-gray-800 transition-transform group-hover:scale-105">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 opacity-20 mx-auto mt-5" />
                                    )}
                                </div>
                                <h1 className="text-4xl font-black mb-3 tracking-tighter">{profile.name || "Set Name"}</h1>
                                <p className="text-base font-medium opacity-60 max-w-[320px] leading-relaxed mb-6">{profile.bio || "Write your bio..."}</p>
                                <div className="flex gap-6 justify-center flex-wrap">
                                    <SocialIconPreview socialLinks={profile.socialLinks} />
                                </div>
                                <div className="mt-4 text-sky-500 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Edit Profile</div>
                            </div>
                        );
                    }

                    if (layout === 'FULL_HERO') {
                        return (
                            <div
                                onClick={() => setIsEditingProfile(true)}
                                className="group w-full mb-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative aspect-[4/5] flex flex-col justify-end p-8 cursor-pointer transition-transform hover:scale-[1.01]"
                            >
                                {profile.bannerUrl && (
                                    <div className="absolute inset-0 z-0">
                                        <img src={profile.bannerUrl} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    </div>
                                )}
                                <div className="relative z-10 text-left">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl mb-4 bg-gray-800">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 opacity-20 mx-auto mt-4" />
                                        )}
                                    </div>
                                    <h1 className="text-4xl font-black text-white mb-2 leading-none">{profile.name || "Set Name"}</h1>
                                    <p className="text-sm font-medium text-white/70 max-w-[280px] leading-relaxed mb-6">{profile.bio || "Write your bio..."}</p>
                                    <div className="flex gap-4 flex-wrap">
                                        <SocialIconPreview socialLinks={profile.socialLinks} />
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 className="w-4 h-4" />
                                </div>
                            </div>
                        );
                    }

                    // Default: MODERN_CARD
                    return (
                        <div
                            onClick={() => setIsEditingProfile(true)}
                            className="group relative rounded-2xl p-8 text-center mb-12 border border-white/10 shadow-2xl shadow-black/20 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] backdrop-blur-md"
                            style={{ backgroundColor: cardBg }}
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/5 shadow-2xl">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
                                                <User className="w-12 h-12 text-white/10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                                        <Edit2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-3xl font-black tracking-tight">{profile.name || "Set Name"}</h1>
                                    <p className="text-slate-400 font-medium leading-relaxed">{profile.bio || "Write your bio..."}</p>
                                </div>

                                <div className="flex gap-5 justify-center mt-2 flex-wrap">
                                    <SocialIconPreview socialLinks={profile.socialLinks} />
                                </div>
                            </div>
                        </div>
                    );
                })()}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Your Content</span>
                        <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-3 py-1 rounded-full">{links.length} Blocks</span>
                    </div>

                    {links.map((link, index) => (
                        <div
                            key={link.id}
                            onClick={() => handleOpenEditModal(link)}
                            className="group relative rounded-xl border border-white/10 shadow-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] backdrop-blur-md"
                            style={{ backgroundColor: cardBg }}
                        >
                            <div className="flex flex-col gap-0">
                                <div className={`flex items-center justify-between ${link.type === 'IMAGE' ? 'p-4 pb-3' : 'p-8 pb-4'}`}>
                                    <div className="flex flex-col">
                                        {link.type !== 'TEXT' && (
                                            <h3 className="font-bold text-lg">{link.title || link.type}</h3>
                                        )}
                                        {link.createdAt && (
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
                                                {new Date(link.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                                            onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }}
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                                            onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
                                            disabled={index === links.length - 1}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {link.type === 'IMAGE' && link.url && (
                                    <div className="overflow-hidden">
                                        <img src={link.url} className="w-full h-auto" />
                                    </div>
                                )}

                                {link.type === 'TEXT' && (
                                    <div className="px-8 pb-8 transition-opacity group-hover:opacity-100">
                                        <div className="text-xs text-slate-400 font-medium leading-relaxed h-12 overflow-hidden mask-vertical whitespace-pre-wrap">
                                            {link.url}
                                        </div>
                                    </div>
                                )}

                                {link.type === 'URL' && (
                                    <div className="flex items-center gap-3 text-sky-400 font-mono text-[10px] truncate bg-white/5 p-3 mx-8 mb-8 rounded-xl border border-white/10">
                                        <LinkIcon className="w-3 h-3" />
                                        {link.url}
                                    </div>
                                )}

                                {link.type === 'YOUTUBE' && (
                                    <div className="flex items-center gap-3 text-red-400 font-mono text-[10px] truncate bg-white/5 p-3 mx-8 mb-8 rounded-xl border border-white/10">
                                        <Youtube className="w-3 h-3" />
                                        {link.url}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {links.length === 0 && (
                        <div className="text-center py-24 bg-[#0f172a] rounded-xl border-2 border-dashed border-white/5">
                            <p className="text-slate-500 text-sm font-medium italic">Empty Canvas ✨</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-2">Tap + to add blocks</p>
                        </div>
                    )}
                </div>

            </main>

            {/* Floating Tool Bar */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 px-4 w-full max-w-[450px]">
                <div className="flex-1">
                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-16 rounded-xl bg-sky-500 text-white font-black text-lg shadow-2xl shadow-sky-500/20 hover:bg-sky-600 hover:scale-[1.02] active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Publish Profile"}
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
                        className={`h-16 w-16 rounded-xl font-black shadow-2xl transition-all border border-white/5 ${isAddMenuOpen ? 'bg-white text-black rotate-45 scale-90' : 'bg-[#0f172a] text-white hover:scale-110 active:scale-90'}`}
                    >
                        <Plus className="w-8 h-8" strokeWidth={3} />
                    </Button>

                    {/* Popover Menu */}
                    {isAddMenuOpen && (
                        <div className="absolute bottom-24 right-0 w-64 bg-[#0f172a] rounded-xl p-4 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-8 overflow-hidden">
                            {!isColorPickerOpen && !isHeaderMenuOpen ? (
                                <div className="grid grid-cols-1 gap-1">
                                    <button onClick={() => handleOpenAddModal('TEXT')} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 text-left group">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                                            <Type className="w-5 h-5 text-sky-400" />
                                        </div>
                                        <span className="font-bold text-sm text-white">Add Text</span>
                                    </button>
                                    <button onClick={() => handleOpenAddModal('YOUTUBE')} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 text-left group">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                            <Youtube className="w-5 h-5 text-red-500" />
                                        </div>
                                        <span className="font-bold text-sm text-white">Video URL</span>
                                    </button>
                                    <button onClick={() => handleOpenAddModal('URL')} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 text-left group">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                                            <LinkIcon className="w-5 h-5 text-sky-400" />
                                        </div>
                                        <span className="font-bold text-sm text-white">Button</span>
                                    </button>
                                    <button onClick={() => handleOpenAddModal('IMAGE')} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 text-left group">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <span className="font-bold text-sm text-white">Photo</span>
                                    </button>
                                    <button onClick={() => setIsColorPickerOpen(true)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 text-left group">
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                            <Palette className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-white">Theme</span>
                                            <span className="text-[10px] text-slate-500 font-medium uppercase">{profile.themeColor}</span>
                                        </div>
                                    </button>
                                    <button onClick={() => setIsHeaderMenuOpen(true)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 text-left group">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Layout className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-white">Header Style</span>
                                            <span className="text-[10px] text-slate-500 font-medium uppercase">Change Layout</span>
                                        </div>
                                    </button>
                                </div>
                            ) : isColorPickerOpen ? (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Theme</span>
                                        <button onClick={() => setIsColorPickerOpen(false)} className="text-[10px] font-bold text-sky-400 hover:text-sky-300">Back</button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {["#000000", "#1e293b", "#0c4a6e", "#1e1b4b", "#4c1d95", "#701a75", "#831843", "#450a0a"].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    setProfile({ ...profile, themeColor: color });
                                                    setHasChanges(true);
                                                }}
                                                className={`w-full aspect-square rounded-lg border-2 transition-all ${profile.themeColor === color ? 'border-sky-500 scale-110 shadow-lg' : 'border-white/10 hover:border-white/30'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => colorInputRef.current?.click()}
                                        className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-colors"
                                    >
                                        Custom Color
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Header Design</span>
                                        <button onClick={() => setIsHeaderMenuOpen(false)} className="text-[10px] font-bold text-sky-400 hover:text-sky-300">Back</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide">
                                        {[
                                            { id: 'MODERN_CARD', label: 'Classic Card', desc: 'Centered card' },
                                            { id: 'PROFILE_BANNER', label: 'Banner Overlay', desc: 'Banner + Avatar' },
                                            { id: 'MINIMAL_TOP', label: 'Minimal', desc: 'Top aligned' },
                                            { id: 'FULL_HERO', label: 'Full Hero', desc: 'Large Image' }
                                        ].map((layout) => (
                                            <button
                                                key={layout.id}
                                                onClick={() => {
                                                    setProfile({ ...profile, headerLayout: layout.id });
                                                    setHasChanges(true);
                                                }}
                                                className={`flex flex-col p-3 rounded-lg border text-left transition-all ${profile.headerLayout === layout.id
                                                    ? 'border-sky-500 bg-sky-500/10'
                                                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <p className="text-xs font-bold text-white">{layout.label}</p>
                                                <p className="text-[9px] text-slate-500 font-medium">{layout.desc}</p>
                                            </button>
                                        ))}
                                    </div>

                                    {(profile.headerLayout === 'PROFILE_BANNER' || profile.headerLayout === 'FULL_HERO') && (
                                        <div className="space-y-1 mt-2">
                                            <div className="relative h-16 rounded-lg bg-[#1e293b] overflow-hidden border border-white/5 group">
                                                {profile.bannerUrl ? (
                                                    <img src={profile.bannerUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                                        <ImageIcon className="w-4 h-4 text-slate-500 mb-1" />
                                                        <span className="text-[9px] text-slate-500 font-medium">Upload Banner</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                {uploadingBanner && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
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
            </div>

            {/* Creation Modal */}
            {pendingBlock && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="w-full max-w-[420px] bg-[#0f172a] rounded-xl p-6 border border-white/10 shadow-2xl relative text-white">
                        {pendingBlock.type !== 'TEXT' && (
                            <div className="text-center space-y-1 mb-4">
                                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    {pendingBlock.type === 'YOUTUBE' && <Youtube className="w-6 h-6 text-sky-500" />}
                                    {pendingBlock.type === 'IMAGE' && <ImageIcon className="w-6 h-6 text-sky-500" />}
                                    {pendingBlock.type === 'URL' && <LinkIcon className="w-6 h-6 text-sky-500" />}
                                </div>
                                <h2 className="text-lg font-bold tracking-tight">Add New Block</h2>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Fill in the details</p>
                            </div>
                        )}

                        <div className="space-y-4 mt-4">
                            {pendingBlock.type !== 'TEXT' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title / Label <span className="text-red-500">*</span></label>
                                    <input
                                        className="w-full bg-[#1e293b] border border-white/5 rounded-lg h-12 px-4 font-medium focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all text-white placeholder:text-slate-600"
                                        placeholder="Enter Label"
                                        value={pendingBlock.title}
                                        onChange={(e) => setPendingBlock({ ...pendingBlock, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {pendingBlock.type === 'TEXT' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message Content <span className="text-red-500">*</span></label>
                                    <textarea
                                        className="w-full bg-[#1e293b] border border-white/5 rounded-lg p-4 font-medium focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all text-white min-h-[120px] resize-none placeholder:text-slate-600"
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
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Image</label>
                                    <div className="relative min-h-[140px] bg-[#1e293b] rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-sky-500/30 transition-colors">
                                        {pendingBlock.file ? (
                                            <img src={URL.createObjectURL(pendingBlock.file)} className="w-full h-auto block" />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-slate-500" />
                                                <span className="text-[10px] font-medium text-slate-500 uppercase mt-2">Click to upload</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setPendingBlock({ ...pendingBlock, file });
                                        }} />
                                    </div>
                                </div>
                            ) : (pendingBlock.type === 'URL' || pendingBlock.type === 'YOUTUBE') && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{pendingBlock.type === 'YOUTUBE' ? 'YouTube Link' : 'Website URL'}</label>
                                    <input
                                        className="w-full bg-[#1e293b] border border-white/5 rounded-lg h-12 px-4 font-mono text-xs text-sky-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder:text-slate-600"
                                        placeholder="https://..."
                                        value={pendingBlock.url}
                                        onChange={(e) => setPendingBlock({ ...pendingBlock, url: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 mt-6">
                            <button
                                onClick={confirmAddBlock}
                                disabled={isCreating || (pendingBlock.type === 'TEXT' ? !textEditorContent : !pendingBlock.title) || (pendingBlock.type === 'IMAGE' && !pendingBlock.file)}
                                className="h-12 rounded-lg bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Looks Good"}
                            </button>
                            <button
                                onClick={() => setPendingBlock(null)}
                                className="h-10 rounded-lg font-medium text-sm text-slate-400 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modals */}
            {(editingBlock || isEditingProfile) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="w-full max-w-[420px] bg-[#0f172a] rounded-xl p-6 border border-white/10 shadow-2xl relative text-white">
                        <button
                            className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
                            onClick={() => { setEditingBlock(null); setIsEditingProfile(false); }}
                        >
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-white rotate-45 transition-colors" />
                        </button>

                        {isEditingProfile ? (
                            <div className="space-y-6">
                                <div className="text-center space-y-3">
                                    <div className="flex items-center justify-center gap-6">
                                        {/* Avatar Upload */}
                                        <div className="relative w-20 h-20">
                                            <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-white/5 shadow-2xl">
                                                {profile.avatarUrl ? (
                                                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
                                                        <User className="w-6 h-6 text-white/10" />
                                                    </div>
                                                )}
                                            </div>
                                            {uploadingAvatar ? (
                                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                </div>
                                            ) : (
                                                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform">
                                                    <Camera className="w-3.5 h-3.5 text-white" />
                                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                                </label>
                                            )}
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500">Avatar</span>
                                        </div>

                                        {/* Banner Upload */}
                                        <div className="relative w-20 h-20">
                                            <div className="w-full h-full rounded-2xl overflow-hidden ring-4 ring-white/5 shadow-2xl">
                                                {profile.bannerUrl ? (
                                                    <img src={profile.bannerUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-white/10" />
                                                    </div>
                                                )}
                                            </div>
                                            {uploadingBanner ? (
                                                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                </div>
                                            ) : (
                                                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform">
                                                    <Camera className="w-3.5 h-3.5 text-white" />
                                                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                                                </label>
                                            )}
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500">Banner</span>
                                        </div>
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Edit Profile</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</label>
                                        <input
                                            className="w-full bg-[#1e293b] border-none rounded-lg h-14 px-6 font-bold focus:ring-2 focus:ring-sky-500 transition-all text-white"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bio</label>
                                        <textarea
                                            className="w-full bg-[#1e293b] border border-white/5 rounded-lg p-4 font-medium focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all text-white min-h-[80px] resize-none"
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instagram</label>
                                            <input
                                                className="w-full bg-[#1e293b] border-none rounded-lg h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all text-white"
                                                placeholder="@username"
                                                value={profile.socialLinks.instagram || ""}
                                                onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">X (Twitter)</label>
                                            <input
                                                className="w-full bg-[#1e293b] border-none rounded-lg h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all text-white"
                                                placeholder="@username"
                                                value={profile.socialLinks.x || ""}
                                                onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, x: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">YouTube</label>
                                            <input
                                                className="w-full bg-[#1e293b] border-none rounded-lg h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all text-white"
                                                placeholder="@channel"
                                                value={profile.socialLinks.youtube || ""}
                                                onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, youtube: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp</label>
                                            <input
                                                className="w-full bg-[#1e293b] border-none rounded-lg h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all text-white"
                                                placeholder="+1..."
                                                value={profile.socialLinks.whatsapp || ""}
                                                onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, whatsapp: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reddit</label>
                                            <input
                                                className="w-full bg-[#1e293b] border-none rounded-lg h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all text-white"
                                                placeholder="u/username"
                                                value={profile.socialLinks.reddit || ""}
                                                onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, reddit: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</label>
                                            <input
                                                className="w-full bg-[#1e293b] border-none rounded-lg h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all text-white"
                                                placeholder="hello@..."
                                                value={profile.socialLinks.email || ""}
                                                onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, email: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full h-12 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        ) : editingBlock && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2 mb-4">
                                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        {editingBlock.type === 'TEXT' && <Type className="w-6 h-6 text-sky-500" />}
                                        {editingBlock.type === 'IMAGE' && <ImageIcon className="w-6 h-6 text-sky-500" />}
                                        {editingBlock.type === 'URL' && <LinkIcon className="w-6 h-6 text-sky-500" />}
                                        {editingBlock.type === 'YOUTUBE' && <Youtube className="w-6 h-6 text-sky-500" />}
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight text-center">Edit Block</h2>
                                </div>

                                <div className="space-y-4">
                                    {editingBlock.type !== 'TEXT' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</label>
                                            <input
                                                className="w-full bg-[#1e293b] border border-white/5 rounded-lg h-12 px-4 font-medium focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all text-white"
                                                value={editingBlock.title}
                                                onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {editingBlock.type === 'TEXT' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message Content</label>
                                            <textarea
                                                className="w-full bg-[#1e293b] border border-white/5 rounded-lg p-4 font-medium focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all text-white min-h-[120px] resize-none"
                                                value={textEditorContent}
                                                onChange={(e) => {
                                                    setTextEditorContent(e.target.value);
                                                    setEditingBlock({ ...editingBlock, title: e.target.value.slice(0, 30) });
                                                }}
                                            />
                                        </div>
                                    )}

                                    {editingBlock.type === 'IMAGE' ? (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Image</label>
                                            <div className="relative rounded-lg bg-[#1e293b] overflow-hidden group border border-white/10 hover:border-sky-500/30 transition-colors">
                                                {uploadingBlockId === editingBlock.id ? (
                                                    <div className="h-40 flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img src={editingBlock.url} className="w-full h-auto block opacity-60 transition-opacity group-hover:opacity-100" />
                                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleBlockImageUpload(e, editingBlock.id)} />
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <Camera className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (editingBlock.type === 'URL' || editingBlock.type === 'YOUTUBE') && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{editingBlock.type === 'YOUTUBE' ? 'YouTube Link' : 'Website URL'}</label>
                                            <input
                                                className="w-full bg-[#1e293b] border border-white/5 rounded-lg h-12 px-4 font-mono text-xs text-sky-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium"
                                                value={editingBlock.url}
                                                onChange={(e) => setEditingBlock({ ...editingBlock, url: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 mt-4">
                                    <button
                                        onClick={confirmEditBlock}
                                        disabled={saving}
                                        className="h-12 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => { handleDelete(editingBlock.id); setEditingBlock(null); }}
                                        className="h-10 rounded-lg font-medium text-sm text-red-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                                    >
                                        Remove Block
                                    </button>
                                </div>
                            </div>
                        )}
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
