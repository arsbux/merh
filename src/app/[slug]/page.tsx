import {
    Youtube,
    ArrowUpRight,
    User,
    MoreVertical,
    Link as LinkIcon,
    ImageIcon,
    ShoppingBag,
    Plus,
    Heart
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
    // The store now follows a fixed, premium design based on the requested image.
    // Standardizing on the premium "dark, purple, and minimal" aesthetic
    const isDark = true;
    const bgColor = "#000000";
    const textColor = "#ffffff";
    const cardBg = "#0f172a";
    const borderColor = "rgba(255, 255, 255, 0.05)";

    return (
        <div
            className="min-h-screen flex flex-col items-center selection:bg-purple-500/30 selection:text-white font-sans overflow-x-hidden pt-12"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Store Header Section */}
            <div className="w-full max-w-2xl px-6 mb-16 flex items-start gap-8">
                <div className="flex flex-col items-center gap-4 w-1/3 text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-900 border border-white/10 shadow-inner">
                        {store.avatarUrl ? (
                            <img src={store.avatarUrl} alt={store.name || ""} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-10 h-10 opacity-20" />
                            </div>
                        )}
                    </div>
                    <h1 className="text-xl font-black tracking-tight leading-tight">{store.name || slug}</h1>
                </div>

                {store.bio && (
                    <div className="flex-1 min-h-[120px] bg-zinc-900 rounded-2xl p-6 flex items-center justify-center text-center border border-white/5 shadow-sm">
                        <p className="text-sm font-bold leading-relaxed text-zinc-400">
                            {store.bio}
                        </p>
                    </div>
                )}
            </div>

            {/* Social Links Section */}
            <div className="w-full max-w-2xl px-6 mb-12 flex justify-start gap-4">
                <SocialLinks socialLinks={socialLinks} isDark={true} />
            </div>

            {/* Products Grid Section */}
            {store.products && store.products.length > 0 && (
                <div className="w-full max-w-2xl px-6 pb-20">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        {store.products.map((product: any) => (
                            <Link
                                key={product.id}
                                href={`/${slug}/${product.slug || product.slugId || product.id}`}
                                className="flex flex-col gap-3 group"
                            >
                                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 shadow-sm border border-white/5 group">
                                    {product.imageUrls?.[0] ? (
                                        <img
                                            src={product.imageUrls[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 opacity-10" />
                                        </div>
                                    )}

                                    {/* Top Control: Like/Heart */}
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart className="w-3.5 h-3.5 text-white" />
                                    </div>

                                    {/* Bottom Overlay Gradient */}
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                                    {/* Text Content */}
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-[11px] font-bold leading-tight line-clamp-1 opacity-70 mb-1">{product.name}</h3>
                                        <p className="text-lg font-black tracking-tight">
                                            {product.currency === 'UGX' ? 'USh' : '$'}{parseFloat(product.price || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="w-full pt-12 pb-12 text-center mt-auto flex flex-col items-center gap-4">
                <p className="text-[10px] font-black tracking-[0.4em] text-zinc-800 uppercase flex items-center gap-2">
                    Powered By Ventra <MoreVertical className="w-3 h-3" />
                </p>
            </footer>
        </div>
    );
}

function SocialLinks({ socialLinks, isDark }: { socialLinks: any, isDark: boolean }) {
    const iconClass = `w-8 h-8 opacity-80 hover:opacity-100 transition-all ${isDark ? 'brightness-0 invert' : ''}`;

    return (
        <div className="flex gap-4">
            {socialLinks.instagram && (
                <Link href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/instagram.png" className={iconClass} alt="Instagram" />
                </Link>
            )}
            {socialLinks.x && (
                <Link href={`https://x.com/${socialLinks.x}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/x.png" className={iconClass} alt="X" />
                </Link>
            )}
            {socialLinks.whatsapp && (
                <Link href={`https://wa.me/${socialLinks.whatsapp}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/whatsapp.png" className={iconClass} alt="WhatsApp" />
                </Link>
            )}
            {socialLinks.email && (
                <Link href={`mailto:${socialLinks.email}`} target="_blank" className="hover:scale-110 transition-transform">
                    <img src="/socials/mail.png" className={iconClass} alt="Email" />
                </Link>
            )}
        </div>
    );
}
