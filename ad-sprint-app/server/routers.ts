import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { researchRouter } from "./routers/research";
import { sprintRouter } from "./routers/sprint";
import { templateRouter } from "./routers/templates";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI-powered brand research endpoint
  research: researchRouter,

  // Ad sprint pipeline: URL → angles → images → test plan
  sprint: sprintRouter,

  // Ad template management (built-in + custom)
  templates: templateRouter,
});

export type AppRouter = typeof appRouter;
