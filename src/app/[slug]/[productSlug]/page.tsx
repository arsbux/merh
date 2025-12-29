
import { notFound } from "next/navigation";
import { getProductBySlugOrId } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Share2, MoreVertical, ShoppingBag } from "lucide-react";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string; productSlug: string }>;
}) {
    const { slug, productSlug } = await params;
    const data = await getProductBySlugOrId(slug, productSlug);

    if (!data) return notFound();
    const { product, store } = data;

    const themeColor = store.themeColor || "#000000";
    const isDark = themeColor === "#000000";
    const bgColor = isDark ? "#020617" : themeColor;
    const textColor = "#ffffff";
    const cardBg = "rgba(15, 23, 42, 0.4)"; // Deep navy translucent
    const buttonBg = "#ffffff";
    const buttonText = isDark ? "#020617" : themeColor;

    return (
        <div
            className="min-h-screen flex flex-col items-center px-4 pt-8 pb-12 selection:bg-sky-400 selection:text-white transition-colors duration-1000 font-sans"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Nav / Header */}
            <div className="w-full max-w-[480px] flex items-center justify-between mb-8 opacity-90">
                <Link
                    href={`/${store.slug}`}
                    className="flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                        {store.avatarUrl ? (
                            <img src={store.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-white/20" />
                        )}
                    </div>
                    <span>{store.name}</span>
                </Link>
            </div>

            {/* Product Card */}
            <div
                className="w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md border border-white/10"
                style={{ backgroundColor: cardBg }}
            >
                {/* Images */}
                {product.imageUrls && product.imageUrls.length > 0 ? (
                    <div className="aspect-square w-full bg-black/20 relative overflow-hidden group">
                        <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Simple gallery indicator if multiple images exist could go here */}
                        {product.imageUrls.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {product.imageUrls.map((_: string, i: number) => (
                                    <div key={i} className={`w-2 h-2 rounded-full shadow-sm ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="aspect-video w-full flex items-center justify-center bg-white/5">
                        <ShoppingBag className="w-16 h-16 opacity-10" />
                    </div>
                )}

                <div className="p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h1 className="text-3xl font-black tracking-tight leading-tight">{product.name}</h1>
                        <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <span className="text-xl font-black tracking-tight">${parseFloat(product.price).toFixed(2)}</span>
                        </div>
                    </div>

                    <p className="text-base leading-relaxed opacity-80 whitespace-pre-wrap mb-8">
                        {product.description || "No description provided."}
                    </p>

                    <button
                        className="w-full py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: buttonBg, color: buttonText }}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {product.buttonText || "Get Started"}
                    </button>

                    <div className="mt-6 flex items-center justify-center">
                        <p className="text-xs font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
                            Secure Payment
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full pt-12 pb-4 text-center mt-auto flex flex-col items-center gap-4">
                <Link href="/" className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase flex items-center gap-2 hover:opacity-100 transition-opacity">
                    Powered By Ventra <MoreVertical className="w-3 h-3" />
                </Link>
            </footer>
        </div>
    );
}
