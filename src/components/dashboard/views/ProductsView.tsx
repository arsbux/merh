"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package, Share2, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";

export function ProductsView({
    products,
    handleOpenEditProduct,
    handleDeleteProduct,
    handleTogglePublish,
    store
}: any) {
    const router = useRouter();
    const copyLink = (productSlug: string) => {
        const url = `${window.location.origin}/${store?.slug}/${productSlug}`;
        navigator.clipboard.writeText(url);
        toast.success("Product link copied!");
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">Products</h2>
                    <p className="text-sm text-zinc-500 font-medium hidden md:block">Manage your digital products and services.</p>
                </div>
                <Button
                    onClick={() => router.push('/addproduct')}
                    className="bg-white hover:bg-zinc-200 text-black font-bold text-sm h-10 px-4 rounded-lg shadow-md hover:shadow-purple-500/20 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Add Product</span><span className="md:hidden">Add</span>
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 rounded-2xl border border-white/10 shadow-sm">
                    <div className="w-20 h-20 rounded-xl bg-purple-900/10 flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">No products yet</h3>
                    <p className="text-zinc-500 font-bold text-sm max-w-[240px] text-center leading-relaxed">
                        Start your journey by adding your first digital product or service.
                    </p>
                    <Button
                        onClick={() => router.push('/addproduct')}
                        className="mt-8 bg-white hover:bg-zinc-200 text-black font-black h-14 px-8 rounded-xl shadow-xl shadow-purple-500/10 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add your first product
                    </Button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-zinc-900 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-black/20 border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Piece</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Price</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product: any) => (
                                    <tr key={product.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                    {product.imageUrls?.[0] ? (
                                                        <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-zinc-700" strokeWidth={1.5} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-base tracking-tight leading-tight">{product.name}</p>
                                                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">{product.description ? "Detailed Description" : "Direct Link Ready"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-base text-white tracking-tight">{product.currency === 'UGX' ? 'USh' : '$'}{parseFloat(product.price || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-purple-500/5 text-purple-400/80 uppercase tracking-widest">
                                                {product.type || "DIGITAL"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${product.isPublished !== false ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-zinc-500'}`}>
                                                <div className={`w-1 h-1 rounded-full ${product.isPublished !== false ? 'bg-white' : 'bg-white/20'}`} />
                                                {product.isPublished !== false ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-purple-500/10 hover:text-purple-300 transition-all text-zinc-400" onClick={() => copyLink(product.slug || product.id)}>
                                                    <Share2 className="w-4 h-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-purple-500/10 hover:text-purple-300 transition-all text-zinc-400">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-2xl border border-white/10 bg-zinc-900 text-white shadow-2xl p-2">
                                                        <DropdownMenuItem onClick={() => handleOpenEditProduct(product)} className="rounded-xl font-bold py-3 px-4 focus:bg-purple-500/10 focus:text-purple-300 cursor-pointer">
                                                            <Edit className="w-4 h-4 mr-3 opacity-40" /> Edit Piece
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleTogglePublish(product.id, product.isPublished !== false)} className="rounded-xl font-bold py-3 px-4 focus:bg-purple-500/10 focus:text-purple-300 cursor-pointer">
                                                            {product.isPublished !== false ? <EyeOff className="w-4 h-4 mr-3 opacity-40" /> : <Eye className="w-4 h-4 mr-3 opacity-40" />}
                                                            {product.isPublished !== false ? 'Hide from Store' : 'Go Live'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 rounded-xl font-bold py-3 px-4 cursor-pointer" onClick={() => handleDeleteProduct(product.id)}>
                                                            <Trash2 className="w-4 h-4 mr-3 opacity-40" /> Remove Permanently
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (Polished) */}
                    <div className="md:hidden space-y-4">
                        {products.map((product: any) => (
                            <div
                                key={product.id}
                                className="group relative bg-zinc-900 rounded-2xl border border-white/10 shadow-sm p-5 transition-all hover:shadow-xl active:scale-[0.98]"
                            >
                                <div className="flex gap-6">
                                    <div className="w-28 h-28 rounded-2xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/10 shadow-inner relative group-hover:scale-105 transition-transform duration-500">
                                        {product.imageUrls?.[0] ? (
                                            <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-10 h-10 text-zinc-700" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-black text-white line-clamp-2 text-lg leading-tight tracking-tight">{product.name}</h3>
                                            <div className="bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/10 flex-shrink-0">
                                                <span className="text-purple-400 font-black text-sm whitespace-nowrap">
                                                    {product.currency === 'UGX' ? 'USh' : '$'}{parseFloat(product.price || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-600 mb-3">{product.type || "Digital Asset"}</p>
                                        <p className="text-sm text-zinc-400 font-bold line-clamp-2 leading-relaxed">{product.description || "No description provided."}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 w-full gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyLink(product.slug || product.id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl font-black text-sm bg-black/40 text-white border border-white/10 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/20 transition-all shadow-sm"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Copy Link</span>
                                    </button>

                                    <div className="flex items-center gap-6 pr-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenEditProduct(product); }}
                                            className="font-black text-xs uppercase tracking-widest text-zinc-600 hover:text-purple-400 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                            className="font-black text-xs uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
