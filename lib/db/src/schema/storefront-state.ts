import { createInsertSchema } from "drizzle-zod";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type StorefrontCartItem = { name: string; qty: number };

export const storefrontStatesTable = pgTable("storefront_states", {
  userId: text("user_id").primaryKey(),
  cart: jsonb("cart").$type<StorefrontCartItem[]>().notNull().default([]),
  favorites: jsonb("favorites").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertStorefrontStateSchema = createInsertSchema(
  storefrontStatesTable,
).omit({ updatedAt: true });
export type InsertStorefrontState = z.infer<
  typeof insertStorefrontStateSchema
>;
export type StorefrontState = typeof storefrontStatesTable.$inferSelect;
