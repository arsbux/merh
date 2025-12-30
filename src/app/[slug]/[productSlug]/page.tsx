import { notFound } from "next/navigation";
import { getProductBySlugOrId } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ShoppingBag, Plus, ImageIcon, MoreVertical, ShieldCheck } from "lucide-react";
import { Metadata } from 'next';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string; productSlug: string }>;
}): Promise<Metadata> {
    const { slug, productSlug } = await params;
    const data = await getProductBySlugOrId(slug, productSlug);

    if (!data) return {};

    const { product } = data;
    const price = parseFloat(product.price || 0);
    const currency = product.currency || 'USD';
    const currencySymbol = currency === 'UGX' ? 'USh' : (currency === 'EUR' ? '€' : (currency === 'GBP' ? '£' : '$'));

    return {
        title: product.name,
        description: `${product.name} - ${currencySymbol}${price.toLocaleString()} | ${product.description?.substring(0, 150) || "Check out this product"}`,
        openGraph: {
            title: product.name,
            description: `${currencySymbol}${price.toLocaleString()} - ${product.description?.substring(0, 200)}`,
            images: product.imageUrls?.[0] ? [product.imageUrls[0]] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: `${currencySymbol}${price.toLocaleString()} - ${product.description?.substring(0, 200)}`,
            images: product.imageUrls?.[0] ? [product.imageUrls[0]] : [],
        }
    };
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string; productSlug: string }>;
}) {
    const { slug, productSlug } = await params;
    const data = await getProductBySlugOrId(slug, productSlug);

    if (!data) return notFound();
    const { product, store } = data;

    const price = parseFloat(product.price || 0);
    const currency = product.currency || 'USD';
    const currencySymbol = currency === 'UGX' ? 'USh' : (currency === 'EUR' ? '€' : (currency === 'GBP' ? '£' : '$'));

    // WhatsApp Ordering Logic
    const storeWhatsapp = (store.socialLinks as any)?.whatsapp;
    const productUrl = `https://tryventra.com/${slug}/${product.slug || product.id}`;
    const whatsappMessage = encodeURIComponent(`Can I get this? ${productUrl}`);
    const whatsappUrl = storeWhatsapp
        ? `https://wa.me/${storeWhatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`
        : "#";

    return (
        <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center md:py-10 font-sans selection:bg-purple-500/30 selection:text-white">
            <div className="w-full max-w-[440px] bg-zinc-900 md:rounded-2xl overflow-hidden shadow-2xl relative text-white h-full md:h-auto md:min-h-[90vh] flex flex-col border border-white/5">

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pb-10 relative custom-scrollbar">

                    {/* Product Image Section (Top) */}
                    <div className="relative aspect-[4/5] bg-black/20">
                        {product.imageUrls?.[0] ? (
                            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800">
                                <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Image</p>
                            </div>
                        )}

                        {/* Top Controls Overlay */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                            <Link
                                href={`/${slug}`}
                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white/10"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Link>
                            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/10">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="bg-zinc-900 rounded-t-2xl -mt-12 relative z-10 p-6 pt-10 space-y-10">

                        {/* Section 1: Identity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">01</span>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Identity</h3>
                            </div>

                            <div>
                                <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded-full">Official Product</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded-full">In Stock</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-black/40 border border-white/5 rounded-xl px-6 py-4 flex flex-col justify-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Price</span>
                                    <span className="text-2xl font-black text-white">{currencySymbol}{price.toLocaleString()}</span>
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

                            <div className="bg-black/20 border border-white/5 rounded-xl p-6">
                                <p className="text-base font-bold text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                    {product.description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        {/* Security / Info */}
                        <div className="pt-4 flex flex-col gap-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700">
                                <ShieldCheck className="w-3 h-3 text-purple-500/50" /> Secure Payment via Ventra
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 z-20">
                    <div className="flex items-center gap-4">
                        {product.type === 'DIGITAL' && store.checkoutMode === 'CHECKOUT' ? (
                            <Link
                                href={`/pay/${store.userId}/${price}?productName=${encodeURIComponent(product.name)}`}
                                className="flex-1 bg-white text-black rounded-xl h-16 text-lg font-black shadow-xl shadow-purple-500/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Buy now {currencySymbol}{price.toLocaleString()}
                            </Link>
                        ) : (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-white text-black rounded-xl h-16 text-lg font-black shadow-xl shadow-purple-500/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {product.type === 'SERVICE' ? 'Book Service' : (product.type === 'PHYSICAL' ? 'Order Now' : 'I want this')}
                            </a>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
