"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createStore(userId: string, email: string, slug: string, name: string) {
    try {
        // Check if store already exists
        const existing = await db.store.findUnique({ where: { slug } });
        if (existing) return { success: false, error: "Slug already taken" };

        const store = await db.store.create({
            data: {
                slug,
                name: name || slug,
                user: {
                    connectOrCreate: {
                        where: { id: userId },
                        create: { id: userId, email }
                    }
                }
            },
        });
        return { success: true, store };
    } catch (error: any) {
        console.error("Error creating store:", error);
        return { success: false, error: error.message };
    }
}

export async function updateStoreProfile(userId: string, data: { name?: string; bio?: string; avatarUrl?: string; bannerUrl?: string; themeColor?: string; headerLayout?: string; socialLinks?: any }) {
    try {
        const updateData: any = {
            name: data.name,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            themeColor: data.themeColor,
            socialLinks: data.socialLinks,
        };

        // Add new fields to updateData
        if (data.bannerUrl) updateData.bannerUrl = data.bannerUrl;
        if (data.headerLayout) updateData.headerLayout = data.headerLayout;

        const store = await db.store.update({
            where: { userId },
            data: updateData,
        });

        revalidatePath("/dashboard");
        revalidatePath(`/${store.slug}`);

        // Return the updated store object with the new headerLayout
        return {
            success: true,
            store: {
                ...store,
                headerLayout: data.headerLayout || store.headerLayout
            }
        };
    } catch (error) {
        console.error("Error updating store profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function addStoreLink(storeId: string, data: { title: string; url: string; type: string }) {
    try {
        // Use raw SQL to bypass Prisma Client validation
        const firstLinks: any[] = await db.$queryRawUnsafe(
            `SELECT * FROM "Link" WHERE "storeId" = $1 ORDER BY "order" ASC LIMIT 1`,
            storeId
        );
        const order = firstLinks.length > 0 ? firstLinks[0].order - 1 : 0;

        const links: any[] = await db.$queryRawUnsafe(
            `INSERT INTO "Link" (id, "storeId", title, url, type, "order") 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) 
             RETURNING *`,
            storeId,
            data.title,
            data.url,
            data.type,
            order
        );

        revalidatePath("/dashboard");
        return { success: true, link: links[0] };
    } catch (error) {
        console.error("Error adding link:", error);
        return { success: false, error: "Failed to add link" };
    }
}

export async function updateStoreLinks(links: { id: string; title: string; url: string; order: number }[]) {
    try {
        // Use raw SQL to bypass Prisma Client validation
        for (const link of links) {
            await db.$queryRawUnsafe(
                `UPDATE "Link" SET title = $1, url = $2, "order" = $3 WHERE id = $4`,
                link.title,
                link.url,
                link.order,
                link.id
            );
        }
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating links:", error);
        return { success: false, error: "Failed to update links" };
    }
}

export async function deleteStoreLink(linkId: string) {
    try {
        // Use raw SQL to bypass Prisma Client validation
        await db.$queryRawUnsafe(`DELETE FROM "Link" WHERE id = $1`, linkId);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting link:", error);
        return { success: false, error: "Failed to delete link" };
    }
}

export async function getStoreBySlug(slug: string) {
    try {
        // Use raw SQL to bypass all Prisma Client validation issues
        const stores: any[] = await db.$queryRawUnsafe(`SELECT * FROM "Store" WHERE slug = $1 LIMIT 1`, slug);
        if (!stores || stores.length === 0) return null;

        const store = stores[0];
        const links: any[] = await db.$queryRawUnsafe(`SELECT * FROM "Link" WHERE "storeId" = $1 ORDER BY "order" ASC`, store.id);
        const products: any[] = await db.$queryRawUnsafe(`SELECT * FROM "Product" WHERE "storeId" = $1`, store.id);

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
        // Use raw SQL to bypass Prisma Client validation issues
        const stores: any[] = await db.$queryRawUnsafe(`SELECT * FROM "Store" WHERE "userId" = $1 LIMIT 1`, userId);
        if (!stores || stores.length === 0) return null;

        const store = stores[0];
        const links: any[] = await db.$queryRawUnsafe(`SELECT * FROM "Link" WHERE "storeId" = $1 ORDER BY "order" ASC`, store.id);

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
        const existing = await db.store.findUnique({ where: { slug } });

        // If no one has this slug, it's available
        if (!existing) return { available: true };

        // If the current user already owns this slug, it's also "available" for them
        if (currentUserId && existing.userId === currentUserId) return { available: true };

        return { available: false };
    } catch (error) {
        console.error("Slug check error:", error);
        return { available: null, error: "Database connection failed" };
    }
}

export async function updateStoreSlug(userId: string, newSlug: string) {
    try {
        // Double check availability
        const existing = await db.store.findUnique({ where: { slug: newSlug } });
        if (existing && existing.userId !== userId) {
            return { success: false, error: "Handle already taken" };
        }

        await db.store.update({
            where: { userId },
            data: { slug: newSlug }
        });

        revalidatePath("/dashboard");
        revalidatePath(`/${newSlug}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
