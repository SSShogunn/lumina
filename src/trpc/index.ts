import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user?.email || !user?.id)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    return { success: true };
  }),
});
// Export type router type signature,
// NOT the router itself.

export type AppRouter = typeof appRouter;
