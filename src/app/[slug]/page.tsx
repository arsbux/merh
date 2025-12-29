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
    const isDark = false; // standardizing on white theme as per the requested design
    const bgColor = "#ffffff";
    const textColor = "#000000";
    const cardBg = "#F5F5F5"; // Light gray for info box and card elements
    const borderColor = "rgba(0, 0, 0, 0.05)";

    return (
        <div
            className="min-h-screen flex flex-col items-center selection:bg-black selection:text-white font-sans overflow-x-hidden"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Store Header Section */}
            <div className="w-full max-w-[480px] pt-12 px-6 mb-10 flex items-start gap-4">
                <div className="flex flex-col items-center gap-3 w-1/3 text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-black/5 shadow-inner">
                        {store.avatarUrl ? (
                            <img src={store.avatarUrl} alt={store.name || ""} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-10 h-10 opacity-10" />
                            </div>
                        )}
                    </div>
                    <h1 className="text-lg font-black tracking-tight leading-tight">{store.name || slug}</h1>
                </div>

                {store.bio && (
                    <div className="flex-1 min-h-[120px] bg-[#EAEAEA] rounded-xl p-5 flex items-center justify-center text-center">
                        <p className="text-xs font-bold leading-relaxed text-black/60">
                            {store.bio}
                        </p>
                    </div>
                )}
            </div>

            {/* Social Links Section (Optional but useful) */}
            <div className="w-full max-w-[480px] px-6 mb-12 flex justify-start gap-4">
                <SocialLinks socialLinks={socialLinks} isDark={false} />
            </div>

            {/* Products Grid Section */}
            {store.products && store.products.length > 0 && (
                <div className="w-full max-w-[480px] px-6 pb-20">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        {store.products.map((product: any) => (
                            <Link
                                key={product.id}
                                href={`/${slug}/${product.slug || product.slugId || product.id}`}
                                className="flex flex-col gap-3 group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                style={{ animationDelay: `${Math.random() * 200}ms` }}
                            >
                                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 shadow-sm border border-black/5 group">
                                    {product.imageUrls?.[0] ? (
                                        <img
                                            src={product.imageUrls[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 opacity-5" />
                                        </div>
                                    )}

                                    {/* Top Control: Like/Heart */}
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center">
                                        <Heart className="w-4 h-4 text-white" />
                                    </div>

                                    {/* Bottom Overlay Gradient */}
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                                    {/* Text Content */}
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-xs font-bold leading-tight line-clamp-1 opacity-90">{product.name}</h3>
                                        <p className="text-base font-black mt-0.5">
                                            {product.currency === 'UGX' ? 'USh' : '$'}{parseFloat(product.price || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Bottom Right Action: Shopping Bag - REMOVED */}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="w-full pt-12 pb-8 text-center mt-auto flex flex-col items-center gap-4">
                <p className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase flex items-center gap-2">
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
