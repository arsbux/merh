"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserStore(userId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('Store')
            .select('*')
            .eq('userId', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return { success: true, store: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createStore(userId: string, email: string, slug: string, name: string, country?: string, type?: string, whatsapp?: string) {
    try {
        const supabase = await createClient();

        // Check if slug already exists
        const { data: existingStore } = await supabase
            .from('Store')
            .select('slug')
            .eq('slug', slug)
            .single();

        if (existingStore) return { success: false, error: "Slug already taken" };

        // Ensure user exists (upsert handles existing email/id)
        const { error: userError } = await supabase
            .from('User')
            .upsert({
                id: userId,
                email
            }, { onConflict: 'email' });

        if (userError) {
            console.error("User upsert error:", userError);
            return { success: false, error: userError.message };
        }

        // Create or Update store (upsert on userId)
        const { data: store, error: storeError } = await supabase
            .from('Store')
            .upsert({
                id: crypto.randomUUID(), // Only used if creating new
                slug,
                name: name || slug,
                userId,
                country: country || null,
                whatsapp: whatsapp || null,
                socialLinks: { whatsapp: whatsapp || "" }, // Keep in JSON for redundancy/compatibility
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }, { onConflict: 'userId' })
            .select()
            .single();

        if (storeError) {
            console.error("Store upsert error:", storeError);
            return { success: false, error: storeError.message };
        }

        revalidatePath("/dashboard");
        revalidatePath(`/${slug}`);
        return { success: true, store };
    } catch (error: any) {
        console.error("Critical error in createStore:", error);
        return { success: false, error: error.message };
    }
}

export async function updateStoreProfile(userId: string, data: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    themeColor?: string;
    headerLayout?: string;
    storeLayout?: string;
    socialLinks?: any;
    payoutDetails?: any;
    whatsapp?: string;
    checkoutMode?: string;
}) {
    try {
        const supabase = await createClient();

        // 1. Try to find the store
        let { data: store, error: fetchError } = await supabase
            .from('Store')
            .select('slug')
            .eq('userId', userId)
            .single();

        // 2. If store missing (PGRST116), create it
        if (fetchError && fetchError.code === 'PGRST116') {
            const newSlug = `user-${Date.now().toString().slice(-6)}`;

            const { data: newStore, error: createError } = await supabase
                .from('Store')
                .insert({
                    id: crypto.randomUUID(),
                    userId,
                    slug: newSlug,
                    name: data.name || "My Store",
                    bio: data.bio,
                    avatarUrl: data.avatarUrl,
                    bannerUrl: data.bannerUrl,
                    themeColor: data.themeColor || '#000000',
                    headerLayout: data.headerLayout || 'MODERN_CARD',
                    storeLayout: data.storeLayout || 'LIST_DETAIL',
                    socialLinks: data.socialLinks || {},
                    payoutDetails: data.payoutDetails || {}
                })
                .select('slug')
                .single();

            if (createError) throw createError;
            store = newStore;

            revalidatePath("/dashboard");
            revalidatePath(`/${store.slug}`);
            return { success: true };
        } else if (fetchError) {
            throw fetchError;
        }

        // 3. Store exists, update it
        const { error: updateError } = await supabase
            .from('Store')
            .update({
                name: data.name,
                bio: data.bio,
                avatarUrl: data.avatarUrl,
                bannerUrl: data.bannerUrl,
                themeColor: data.themeColor,
                headerLayout: data.headerLayout,
                storeLayout: data.storeLayout,
                socialLinks: data.socialLinks,
                payoutDetails: data.payoutDetails,
                whatsapp: data.whatsapp,
                checkoutMode: data.checkoutMode, // Add this
                updatedAt: new Date().toISOString()
            })
            .eq('userId', userId);

        if (updateError) throw updateError;

        revalidatePath("/dashboard");
        if (store?.slug) {
            revalidatePath(`/${store.slug}`);
        }

        return { success: true, store };
    } catch (error: any) {
        console.error("Error updating store profile:", error);
        return { success: false, error: error.message || "Failed to update profile" };
    }
}

export async function addStoreLink(storeId: string, data: { title: string; url: string; type: string }) {
    try {
        const supabase = await createClient();

        // Get max order
        const { data: links } = await supabase
            .from('Link')
            .select('order')
            .eq('storeId', storeId)
            .order('order', { ascending: true })
            .limit(1);

        const order = (links && links.length > 0) ? links[0].order - 1 : 0;

        const { data: newLink, error } = await supabase
            .from('Link')
            .insert({
                id: crypto.randomUUID(),
                storeId,
                title: data.title,
                url: data.url,
                type: data.type,
                order
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard");
        return { success: true, link: newLink };
    } catch (error: any) {
        console.error("Error adding link:", error);
        return { success: false, error: error.message || "Failed to add link" };
    }
}

export async function updateStoreLinks(links: { id: string; title: string; url: string; order: number }[]) {
    try {
        const supabase = await createClient();

        for (const link of links) {
            await supabase
                .from('Link')
                .update({
                    title: link.title,
                    url: link.url,
                    order: link.order
                })
                .eq('id', link.id);
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating links:", error);
        return { success: false, error: error.message || "Failed to update links" };
    }
}

export async function deleteStoreLink(linkId: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from('Link').delete().eq('id', linkId);
        if (error) throw error;

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting link:", error);
        return { success: false, error: error.message || "Failed to delete link" };
    }
}

export async function getStoreBySlug(slug: string) {
    try {
        const supabase = await createClient();

        const { data: store, error: storeError } = await supabase
            .from('Store')
            .select('*')
            .eq('slug', slug)
            .single();

        if (storeError) return null;

        const { data: links } = await supabase
            .from('Link')
            .select('*')
            .eq('storeId', store.id)
            .order('order', { ascending: true });

        const { data: products } = await supabase
            .from('Product')
            .select('*')
            .eq('storeId', store.id)
            .eq('isPublished', true)
            .order('order', { ascending: true });

        return {
            ...store,
            links: links || [],
            products: products || []
        };
    } catch (error) {
        console.error("Critical fetch failure:", error);
        return null;
    }
}

export async function getStoreByUserId(userId: string) {
    try {
        const supabase = await createClient();

        const { data: store, error: storeError } = await supabase
            .from('Store')
            .select('*')
            .eq('userId', userId)
            .single();

        if (storeError) return null;

        const { data: links } = await supabase
            .from('Link')
            .select('*')
            .eq('storeId', store.id)
            .order('order', { ascending: true });

        return {
            ...store,
            links: links || []
        };
    } catch (error) {
        console.error("Error fetching store by userId:", error);
        return null;
    }
}

export async function checkSlugAvailability(slug: string, currentUserId?: string) {
    try {
        const supabase = await createClient();

        const { data: existing, error } = await supabase
            .from('Store')
            .select('userId')
            .eq('slug', slug)
            .single();

        if (error && error.code === 'PGRST116') return { available: true }; // No match found
        if (error) throw error;

        if (currentUserId && existing.userId === currentUserId) return { available: true };

        return { available: false };
    } catch (error: any) {
        console.error("Slug check error:", error);
        return { available: null, error: error.message || "Database connection failed" };
    }
}

export async function updateStoreSlug(userId: string, newSlug: string) {
    try {
        const supabase = await createClient();

        const { data: existing } = await supabase
            .from('Store')
            .select('userId')
            .eq('slug', newSlug)
            .single();

        if (existing && existing.userId !== userId) {
            return { success: false, error: "Handle already taken" };
        }

        const { error } = await supabase
            .from('Store')
            .update({ slug: newSlug })
            .eq('userId', userId);

        if (error) throw error;

        revalidatePath("/dashboard");
        revalidatePath(`/${newSlug}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating slug:", error);
        return { success: false, error: error.message };
    }
}

// ==================== PRODUCT ACTIONS ====================

export async function addProduct(storeId: string, data: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    type: string;
    imageUrls: string[];
    fileUrl?: string;
    buttonText?: string;
}) {
    try {
        if (!storeId) {
            console.error("addProduct called with missing storeId");
            return { success: false, error: "Missing Store ID" };
        }

        const supabase = await createClient();

        // Generate a basic slug from the name
        const baseSlug = data.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'product';

        // Append random chars to ensure uniqueness and avoid conflicts
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

        const { data: product, error } = await supabase
            .from('Product')
            .insert({
                id: crypto.randomUUID(),
                storeId,
                name: data.name,
                description: data.description || null,
                price: data.price,
                currency: data.currency || "USD",
                type: data.type,
                imageUrls: data.imageUrls,
                fileUrl: data.fileUrl || null,
                buttonText: data.buttonText || "Get Started",
                isPublished: true,
                order: 0,
                slug: slug
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard");
        return { success: true, product };
    } catch (error: any) {
        console.error("Error adding product:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProduct(productId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    type?: string;
    imageUrls?: string[];
    fileUrl?: string;
    buttonText?: string;
}) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('Product')
            .update({
                name: data.name,
                description: data.description,
                price: data.price,
                currency: data.currency,
                type: data.type,
                imageUrls: data.imageUrls,
                fileUrl: data.fileUrl,
                buttonText: data.buttonText,
                updatedAt: new Date().toISOString()
            })
            .eq('id', productId);

        if (error) throw error;

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteProduct(productId: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from('Product').delete().eq('id', productId);
        if (error) throw error;

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleProductPublished(productId: string, isPublished: boolean) {
    // Kept for backward compatibility if needed, but UI will hide usage
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('Product')
            .update({
                isPublished,
                updatedAt: new Date().toISOString()
            })
            .eq('id', productId);

        if (error) throw error;

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling product:", error);
        return { success: false, error: error.message };
    }
}

export async function getProductsByStoreId(storeId: string) {
    try {
        const supabase = await createClient();

        const { data: products, error } = await supabase
            .from('Product')
            .select('*')
            .eq('storeId', storeId)
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return products || [];
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function getProductBySlugOrId(storeSlug: string, productIdentifier: string) {
    try {
        const supabase = await createClient();

        // 1. Get Store
        const { data: store, error: storeError } = await supabase
            .from('Store')
            .select('*')
            .eq('slug', storeSlug)
            .single();

        if (storeError || !store) return null;

        // 2. Try to find product by Slug first
        let { data: product, error: productError } = await supabase
            .from('Product')
            .select('*')
            .eq('storeId', store.id)
            .eq('slug', productIdentifier)
            // .eq('isPublished', true) // Removed to allow all products
            .single();

        // 3. If not found by slug, and identifier looks like a UUID, try ID
        if (!product && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productIdentifier)) {
            const { data: productById } = await supabase
                .from('Product')
                .select('*')
                .eq('storeId', store.id)
                .eq('id', productIdentifier)
                // .eq('isPublished', true) // Removed to allow all products
                .single();
            product = productById;
        }

        if (!product) return null;

        return { product, store };
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function getTransactions(storeId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', storeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, transactions: data };
    } catch (error: any) {
        console.error("Error fetching transactions:", error);
        return { success: false, error: error.message };
    }
}
