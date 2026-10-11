import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, storefrontStatesTable } from "@workspace/db";
import {
  GetStorefrontStateResponse,
  SaveStorefrontStateBody,
  SaveStorefrontStateResponse,
  type ApiError,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/storefront/state", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    const error: ApiError = { error: "Authentication required" };
    res.status(401).json(error);
    return;
  }

  const [saved] = await db
    .select()
    .from(storefrontStatesTable)
    .where(eq(storefrontStatesTable.userId, userId));

  res.json(
    GetStorefrontStateResponse.parse({
      cart: saved?.cart ?? [],
      favorites: saved?.favorites ?? [],
      isNew: !saved,
    }),
  );
});

router.put("/storefront/state", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    const error: ApiError = { error: "Authentication required" };
    res.status(401).json(error);
    return;
  }

  const parsed = SaveStorefrontStateBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid storefront state");
    const error: ApiError = { error: "Invalid cart or favorites data" };
    res.status(400).json(error);
    return;
  }

  const state = parsed.data;
  await db
    .insert(storefrontStatesTable)
    .values({
      userId,
      cart: state.cart,
      favorites: state.favorites,
    })
    .onConflictDoUpdate({
      target: storefrontStatesTable.userId,
      set: {
        cart: state.cart,
        favorites: state.favorites,
        updatedAt: new Date(),
      },
    });

  res.json(
    SaveStorefrontStateResponse.parse({
      cart: state.cart,
      favorites: state.favorites,
      isNew: false,
    }),
  );
});

export default router;
