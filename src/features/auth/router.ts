import { auth } from "@/lib/auth.js";
import { Hono } from "hono";

const authRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

authRouter.use("*", async (ctx, next) => {
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session) {
    ctx.set("user", null);
    ctx.set("session", null);
    await next();
    return;
  }

  ctx.set("user", session.user);
  ctx.set("session", session.session);
  await next();
});

authRouter.get("/session", (ctx) => {
  const session = ctx.get("session");
  const user = ctx.get("user");

  if (!user) return ctx.body(null, 401);

  return ctx.json({
    session,
    user,
  });
});

authRouter.on(["POST", "GET"], "/*", (ctx) => {
  return auth.handler(ctx.req.raw);
});

export default authRouter;
