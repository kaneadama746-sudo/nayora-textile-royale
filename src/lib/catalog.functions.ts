import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error("Vérification du rôle échouée");
  if (!data) throw new Error("Accès réservé aux administrateurs");
}

// ============ PUBLIC READS (via service role pour éviter besoin de session) ============
export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const [cats, cols, fabs, settings] = await Promise.all([
    supabaseAdmin.from("categories").select("*").order("position"),
    supabaseAdmin.from("colors").select("*").order("position"),
    supabaseAdmin.from("fabrics").select("*").eq("active", true).order("position"),
    supabaseAdmin.from("site_settings").select("*"),
  ]);
  const settingsMap: Record<string, any> = {};
  for (const s of settings.data ?? []) settingsMap[s.key] = s.value;
  return {
    categories: cats.data ?? [],
    colors: cols.data ?? [],
    fabrics: fabs.data ?? [],
    settings: settingsMap,
  };
});

// ============ ADMIN READS ============
export const adminListAll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [cats, cols, fabs, settings] = await Promise.all([
      supabaseAdmin.from("categories").select("*").order("position"),
      supabaseAdmin.from("colors").select("*").order("position"),
      supabaseAdmin.from("fabrics").select("*").order("position"),
      supabaseAdmin.from("site_settings").select("*"),
    ]);
    const settingsMap: Record<string, any> = {};
    for (const s of settings.data ?? []) settingsMap[s.key] = s.value;
    return {
      categories: cats.data ?? [],
      colors: cols.data ?? [],
      fabrics: fabs.data ?? [],
      settings: settingsMap,
    };
  });

// ============ CATEGORIES ============
const catUpsert = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "slug: minuscules, chiffres, tirets"),
  description: z.string().max(500).optional().nullable(),
  position: z.number().int().min(0).max(9999).default(0),
});
export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => catUpsert.parse(i))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("categories").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ COLORS ============
const colUpsert = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  hex: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/, "Format #RRGGBB"),
  position: z.number().int().min(0).max(9999).default(0),
});
export const upsertColor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => colUpsert.parse(i))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("colors").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteColor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("colors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ FABRICS ============
const fabUpsert = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  image_url: z.string().max(2000).optional().nullable(),
  price: z.string().max(60).optional().nullable(),
  category_id: z.string().uuid().nullable().optional(),
  colors: z.array(z.string().max(60)).max(50).default([]),
  position: z.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
});
export const upsertFabric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => fabUpsert.parse(i))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("fabrics").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteFabric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("fabrics").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ SETTINGS ============
export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ key: z.string().min(1).max(60), value: z.any() }).parse(i)
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: data.key, value: data.value });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
