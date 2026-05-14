import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const submitSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(4).max(40),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  fabric: z.string().trim().max(100).optional().or(z.literal("")),
  color: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

export const submitQuoteRequest = createServerFn({ method: "POST" })
  .inputValidator((input) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const { error, data: row } = await supabaseAdmin
      .from("quote_requests")
      .insert({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        fabric: data.fabric || null,
        color: data.color || null,
        message: data.message || null,
      })
      .select("id")
      .single();
    if (error) {
      console.error("submitQuoteRequest error:", error);
      throw new Error("Impossible d'enregistrer la demande");
    }
    return { ok: true, id: row.id };
  });

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error("Vérification du rôle échouée");
  if (!data) throw new Error("Accès réservé aux administrateurs");
}

export const listQuoteRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { quotes: data ?? [] };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["nouveau", "en_cours", "traite", "annule"]).optional(),
  admin_notes: z.string().max(2000).optional().nullable(),
});

export const updateQuoteRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const patch: { status?: string; admin_notes?: string | null } = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes;
    const { error } = await supabase
      .from("quote_requests")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteQuoteRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { error } = await supabase.from("quote_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (error) return { isAdmin: false };
    return { isAdmin: !!data };
  });
