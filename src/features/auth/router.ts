import { auth } from "@/lib/auth.js";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { registerSchema } from "./schemas/schemas.js";

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

authRouter.on(["POST", "GET"], "/*", (ctx) => {
  return auth.handler(ctx.req.raw);
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

authRouter.post(
  "/register",
  zValidator("json", registerSchema),
  async (ctx) => {
    const data = ctx.req.valid("json");
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: data.username,
          email: data.email,
          password: data.password,
        },
      });

      if (!result) {
        return ctx.json(
          {
            success: false,
            message: "Error al registrar el usuario.",
          },
          400,
        );
      }

      return ctx.json(
        {
          success: true,
          message: "Usuario registrado correctamente.",
        },
        201,
      );
    } catch (_) {
      return ctx.json(
        {
          success: false,
          message: "Error interno del servidor.",
        },
        500,
      );
    }
  },
);

export default authRouter;
