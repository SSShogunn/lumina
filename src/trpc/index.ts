import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.email || !user?.id) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const dbUser = await db.user.findFirst({
            where: {
                id: user.id,
            },
        });

        if (!dbUser) {
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                },
            });
        }

        return { success: true };
    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;
        return await db.file.findMany({
            where: {
                userId,
            },
        });
    }),
    deleteUserFiles: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const file = await db.file.findFirst({
            where: {
                id: input.id,
                userId,
            },
        });

        if (!file) throw new TRPCError({ code: "NOT_FOUND" });

        await db.file.delete({
            where: {
                id: input.id,
                userId,
            },
        });

        return file;
    }),
    getFileUploadStatus: privateProcedure.input(z.object({ fileId: z.string() })).query(async ({ input, ctx }) => {
        const file = await db.file.findFirst({
            where: {
                id: input.fileId,
                userId: ctx.userId,
            },
        });
        if (!file) return { status: 'PENDING' as const };

        return { status: file.uploadStatus };
    }),
    getFile: privateProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const file = await db.file.findFirst({
            where: {
                key: input.key,
                userId,
            },
        });
        if (!file) {
            throw new TRPCError({ code: "NOT_FOUND" });
        }
        return file;
    }),
    getFileMessages: privateProcedure.input(z.object({ limit: z.number().min(1).max(100).nullish(), cursor: z.string().nullish(), fileId: z.string() })).query(async ({ ctx, input }) => {
        const { userId } = ctx;
        const { fileId, cursor } = input;
        const limit = input.limit ?? INFINITE_QUERY_LIMIT;

        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId,
            },
        });

        if (!file) {
            throw new TRPCError({ code: "NOT_FOUND" });
        }

        const messages = await db.message.findMany({
            take: limit + 1,
            where: {
                fileId,
            },
            orderBy: {
                createTime: "desc",
            },
            cursor: cursor ? { id: cursor } : undefined,
            select: {
                id: true,
                isUserMessage: true,
                createTime: true,
                text: true,
            },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (messages.length > limit) {
            const nextItem = messages.pop();
            nextCursor = nextItem?.id;
        }

        return {
            messages,
            nextCursor,
        };
    }),
    createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
        const billingUrl = absoluteUrl("/dashboard/billing");

        const { userId } = ctx;
        if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

        const dbUser = await db.user.findFirst({
            where: {
                id: userId,
            },
        });
        if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

        const subscriptionPlan = await getUserSubscriptionPlan();

        if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: dbUser.stripeCustomerId,
                return_url: billingUrl,
            });

            return { url: stripeSession.url };
        }

        try {
            const priceId = PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test;

            if (!priceId) {
                throw new Error("Invalid price ID");
            }

            const stripeSession = await stripe.checkout.sessions.create({
                success_url: billingUrl,
                cancel_url: billingUrl,
                payment_method_types: ["card"],
                mode: "subscription",
                billing_address_collection: "required",
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                metadata: {
                    userId: userId,
                },
            });

            return { url: stripeSession.url };
        } catch (error) {
            console.error("Error creating Stripe session:", error);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create Stripe session" });
        }
    }),
});

export type AppRouter = typeof appRouter;