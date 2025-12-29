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
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Products</h2>
                    <p className="text-sm text-slate-500 font-medium hidden md:block">Manage your digital products and services.</p>
                </div>
                <Button
                    onClick={() => router.push('/addproduct')}
                    className="bg-black hover:bg-slate-800 text-white font-bold text-sm h-10 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Add Product</span><span className="md:hidden">Add</span>
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-black/5 flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-black/20" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-black tracking-tight mb-2">No products yet</h3>
                    <p className="text-black/40 font-bold text-sm max-w-[240px] text-center leading-relaxed">
                        Start your journey by adding your first digital product or service.
                    </p>
                    <Button
                        onClick={() => router.push('/addproduct')}
                        className="mt-8 bg-black hover:bg-black/90 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-black/10 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add your first product
                    </Button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#F8F8F8] border-b border-black/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Piece</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Price</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {products.map((product: any) => (
                                    <tr key={product.id} className="group hover:bg-[#F8F8F8]/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-[#F0F0F0] border border-black/5 overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                    {product.imageUrls?.[0] ? (
                                                        <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-black/10" strokeWidth={1.5} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-black text-base tracking-tight leading-tight">{product.name}</p>
                                                    <p className="text-[11px] text-black/40 font-bold uppercase tracking-tighter mt-1">{product.description ? "Detailed Description" : "Direct Link Ready"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-base text-black tracking-tight">{product.currency === 'UGX' ? 'USh' : '$'}{parseFloat(product.price || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-black/5 text-black/60 uppercase tracking-widest">
                                                {product.type || "DIGITAL"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${product.isPublished !== false ? 'bg-black text-white' : 'bg-black/5 text-black/40'}`}>
                                                <div className={`w-1 h-1 rounded-full ${product.isPublished !== false ? 'bg-white' : 'bg-black/40'}`} />
                                                {product.isPublished !== false ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-black hover:text-white transition-all" onClick={() => copyLink(product.slug || product.id)}>
                                                    <Share2 className="w-4 h-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-black hover:text-white transition-all">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-2xl border-black/5 shadow-2xl p-2">
                                                        <DropdownMenuItem onClick={() => handleOpenEditProduct(product)} className="rounded-xl font-bold py-3 px-4">
                                                            <Edit className="w-4 h-4 mr-3 opacity-40" /> Edit Piece
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleTogglePublish(product.id, product.isPublished !== false)} className="rounded-xl font-bold py-3 px-4">
                                                            {product.isPublished !== false ? <EyeOff className="w-4 h-4 mr-3 opacity-40" /> : <Eye className="w-4 h-4 mr-3 opacity-40" />}
                                                            {product.isPublished !== false ? 'Hide from Store' : 'Go Live'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 rounded-xl font-bold py-3 px-4" onClick={() => handleDeleteProduct(product.id)}>
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
                    <div className="md:hidden space-y-6">
                        {products.map((product: any) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-[2rem] border border-black/5 shadow-sm p-6 transition-all hover:shadow-xl active:scale-[0.98]"
                            >
                                <div className="flex gap-6">
                                    <div className="w-28 h-28 rounded-2xl bg-[#F0F0F0] overflow-hidden flex-shrink-0 border border-black/5 shadow-inner relative group-hover:scale-105 transition-transform duration-500">
                                        {product.imageUrls?.[0] ? (
                                            <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-10 h-10 text-black/10" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-black text-black line-clamp-2 text-lg leading-tight tracking-tight">{product.name}</h3>
                                            <div className="bg-black/5 px-3 py-1.5 rounded-xl border border-black/5 flex-shrink-0">
                                                <span className="text-black font-black text-sm whitespace-nowrap">
                                                    {product.currency === 'UGX' ? 'USh' : '$'}{parseFloat(product.price || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-black/20 mb-3">{product.type || "Digital Asset"}</p>
                                        <p className="text-sm text-black/40 font-bold line-clamp-2 leading-relaxed">{product.description || "No description provided."}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 w-full gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyLink(product.slug || product.id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl font-black text-sm bg-[#F8F8F8] text-black border border-black/5 hover:bg-black hover:text-white transition-all shadow-sm"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Copy Link</span>
                                    </button>

                                    <div className="flex items-center gap-6 pr-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenEditProduct(product); }}
                                            className="font-black text-xs uppercase tracking-widest text-black/20 hover:text-black transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                            className="font-black text-xs uppercase tracking-widest text-black/20 hover:text-red-500 transition-colors"
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
