import {
    Youtube,
    ArrowUpRight,
    User,
    MoreVertical,
    Link as LinkIcon,
    ImageIcon
} from "lucide-react";
import Link from "next/link";
import { getStoreBySlug } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function StorefrontPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const store = await getStoreBySlug(slug);

    if (!store) {
        // If we can't find the store or the DB is offline, show Not Found 
        // to prevent technical red screens for visitors
        return notFound();
    }

    const socialLinks = (store.socialLinks as any) || {};
    const themeColor = store.themeColor || "#000000";

    // Simple heuristic: if theme is black, use dark mode aesthetics. 
    // Otherwise, use the color as the background or accent.
    const isDark = themeColor === "#000000";
    const bgColor = isDark ? "#020617" : themeColor;
    const textColor = "#ffffff";
    const cardBg = "rgba(15, 23, 42, 0.4)"; // Deep navy translucent
    const buttonBg = "#ffffff";
    const buttonText = isDark ? "#020617" : themeColor;

    return (
        <div
            className="min-h-screen flex flex-col items-center px-4 pt-20 pb-12 selection:bg-sky-400 selection:text-white transition-colors duration-1000 font-sans"
            style={{ backgroundColor: bgColor, color: textColor }}
        >

            {/* Profile Header Renderer */}
            {(() => {
                const layout = (store as any).headerLayout || 'MODERN_CARD';
                const bannerUrl = (store as any).bannerUrl;

                if (layout === 'PROFILE_BANNER') {
                    return (
                        <div className="w-full max-w-[400px] mb-10 text-center relative">
                            <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-[-50px]">
                                {bannerUrl ? (
                                    <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/5" />
                                )}
                            </div>
                            <div className={`w-24 h-24 rounded-full mx-auto relative z-10 overflow-hidden border-4 shadow-2xl ${isDark ? 'bg-gray-800 border-[#020617]' : 'bg-white border-' + themeColor}`}>
                                {store.avatarUrl ? (
                                    <img src={store.avatarUrl} alt={store.name || ""} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#1e293b]">
                                        <User className="w-10 h-10 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <h1 className="text-3xl font-black mb-1 tracking-tight">{store.name || slug}</h1>
                                <p className="text-sm font-medium opacity-70 max-w-[300px] mx-auto leading-relaxed">{store.bio}</p>
                                <div className="flex gap-4 justify-center mt-6 flex-wrap">
                                    <SocialLinks socialLinks={socialLinks} />
                                </div>
                            </div>
                        </div>
                    );
                }

                if (layout === 'MINIMAL_TOP') {
                    return (
                        <div className="w-full max-w-[400px] mb-12 flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-full mb-6 overflow-hidden border-2 shadow-xl ${isDark ? 'bg-gray-800 border-white/5' : 'bg-white/20 border-white/20'}`}>
                                {store.avatarUrl ? (
                                    <img src={store.avatarUrl} alt={store.name || ""} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 opacity-20 mx-auto mt-5" />
                                )}
                            </div>
                            <h1 className="text-4xl font-black mb-3 tracking-tighter">{store.name || slug}</h1>
                            <p className="text-base font-medium opacity-60 max-w-[320px] leading-relaxed mb-6">{store.bio}</p>
                            <div className="flex gap-6 justify-center flex-wrap">
                                <SocialLinks socialLinks={socialLinks} />
                            </div>
                        </div>
                    );
                }

                if (layout === 'FULL_HERO') {
                    return (
                        <div className="w-full max-w-[400px] mb-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative aspect-[4/5] flex flex-col justify-end p-8">
                            {bannerUrl && (
                                <div className="absolute inset-0 z-0">
                                    <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                </div>
                            )}
                            <div className="relative z-10 text-left">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl mb-4">
                                    {store.avatarUrl ? (
                                        <img src={store.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 opacity-20 mx-auto mt-4" />
                                    )}
                                </div>
                                <h1 className="text-4xl font-black text-white mb-2 leading-none">{store.name || slug}</h1>
                                <p className="text-sm font-medium text-white/70 max-w-[280px] leading-relaxed mb-6">{store.bio}</p>
                                <div className="flex gap-4 flex-wrap">
                                    <SocialLinks socialLinks={socialLinks} />
                                </div>
                            </div>
                        </div>
                    );
                }

                // Default: MODERN_CARD
                return (
                    <div
                        className="w-full max-w-[400px] text-center mb-10 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md"
                        style={{ backgroundColor: cardBg }}
                    >
                        <div className={`w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden border-2 shadow-2xl ${isDark ? 'bg-gray-800 border-white/5' : 'bg-white/20 border-white/20'}`}>
                            {store.avatarUrl ? (
                                <img src={store.avatarUrl} alt={store.name || ""} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-12 h-12 opacity-20" />
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl font-black mb-2 tracking-tight">{store.name || slug}</h1>
                        <p className="text-sm font-medium leading-relaxed max-w-[280px] mx-auto opacity-70">{store.bio}</p>

                        <div className="flex gap-5 justify-center mt-8 px-4 flex-wrap">
                            <SocialLinks socialLinks={socialLinks} />
                        </div>
                    </div>
                );
            })()}

            {/* Content Blocks */}
            <div className="w-full max-w-[400px] space-y-4">
                {store.links.map((block: any) => {
                    if (block.type === 'HEADING') {
                        return (
                            <h3 key={block.id} className="text-sm font-black uppercase tracking-[0.2em] text-center pt-8 pb-2 opacity-40">
                                {block.title}
                            </h3>
                        );
                    }

                    if (block.type === 'TEXT') {
                        return (
                            <div key={block.id} className="rounded-xl p-8 shadow-lg backdrop-blur-sm border border-white/10" style={{ backgroundColor: cardBg }}>
                                {block.createdAt && (
                                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">
                                        {new Date(block.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                                <div className="text-sm font-medium leading-relaxed opacity-90 whitespace-pre-wrap">
                                    {block.url}
                                </div>
                            </div>
                        );
                    }

                    if (block.type === 'IMAGE') {
                        return (
                            <div key={block.id} className={`group relative rounded-xl overflow-hidden shadow-xl backdrop-blur-sm border border-white/10`} style={{ backgroundColor: cardBg }}>
                                {block.url ? (
                                    <img src={block.url} alt={block.title || ""} className="w-full h-auto block" />
                                ) : (
                                    <div className="w-full aspect-square flex items-center justify-center bg-white/5">
                                        <ImageIcon className="w-12 h-12 opacity-10" />
                                    </div>
                                )}
                                {block.title && (
                                    <div className="p-5 text-center border-t border-white/5" style={{ backgroundColor: cardBg }}>
                                        <p className="text-sm font-bold opacity-90">{block.title}</p>
                                        {block.createdAt && (
                                            <span className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mt-1">
                                                {new Date(block.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    if (block.type === 'YOUTUBE') {
                        const videoId = block.url.includes('http') ? (block.url.split('v=')[1]?.split('&')[0] || block.url.split('/').pop()) : null;
                        if (!videoId || videoId === 'https:' || videoId === 'http:') {
                            return (
                                <div key={block.id} className="rounded-xl overflow-hidden shadow-2xl relative aspect-video bg-gray-100 flex items-center justify-center border border-white/10">
                                    <div className="text-center">
                                        <Youtube className="w-12 h-12 text-gray-200 mx-auto" />
                                        {block.createdAt && (
                                            <span className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-20 mt-4 text-black">
                                                {new Date(block.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        }
                        return (
                            <div key={block.id} className="group flex flex-col gap-2">
                                <div className="rounded-xl overflow-hidden shadow-2xl relative aspect-video bg-black border border-white/10">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                {block.createdAt && (
                                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-30 text-center">
                                        {new Date(block.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        );
                    }

                    // Default: Button Link
                    const isValidUrl = block.url && (block.url.startsWith('http') || block.url.startsWith('mailto:') || block.url.startsWith('tel:'));
                    const href = isValidUrl ? block.url : '#';

                    return (
                        <div key={block.id} className="flex flex-col gap-2">
                            <Link
                                href={href}
                                target={isValidUrl ? "_blank" : undefined}
                                prefetch={false}
                                className={`block w-full rounded-lg py-6 text-center text-lg font-bold shadow-xl transition-all border border-white/10 ${isValidUrl ? 'hover:scale-[1.02] active:scale-[0.98]' : 'opacity-50 cursor-default'}`}
                                style={{ backgroundColor: buttonBg, color: buttonText }}
                            >
                                {block.title}
                            </Link>
                            {block.createdAt && (
                                <span className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-30 text-center">
                                    {new Date(block.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Powered By */}
            <footer className="w-full pt-12 pb-4 text-center mt-auto flex flex-col items-center gap-4">
                <p className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase flex items-center gap-2">
                    Powered By merh.store <MoreVertical className="w-3 h-3" />
                </p>
            </footer>
        </div>
    );
}

function SocialLinks({ socialLinks }: { socialLinks: any }) {
    return (
        <>
            {socialLinks.instagram && (
                <Link href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/instagram.png" className="w-8 h-8 opacity-80 hover:opacity-100" alt="Instagram" />
                </Link>
            )}
            {socialLinks.x && (
                <Link href={`https://x.com/${socialLinks.x}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/x.png" className="w-8 h-8 opacity-80 hover:opacity-100" alt="X" />
                </Link>
            )}
            {socialLinks.youtube && (
                <Link href={`https://youtube.com/${socialLinks.youtube}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/youtube.png" className="w-8 h-8 opacity-80 hover:opacity-100" alt="YouTube" />
                </Link>
            )}
            {socialLinks.whatsapp && (
                <Link href={`https://wa.me/${socialLinks.whatsapp}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/whatsapp.png" className="w-8 h-8 opacity-80 hover:opacity-100" alt="WhatsApp" />
                </Link>
            )}
            {socialLinks.reddit && (
                <Link href={`https://reddit.com/u/${socialLinks.reddit}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/reddit.png" className="w-8 h-8 opacity-80 hover:opacity-100" alt="Reddit" />
                </Link>
            )}
            {socialLinks.email && (
                <Link href={`mailto:${socialLinks.email}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/mail.png" className="w-8 h-8 opacity-80 hover:opacity-100" alt="Email" />
                </Link>
            )}
        </>
    );
}
