import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import postgres from "npm:postgres@3.4.7";

const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const database = postgres(Deno.env.get("SUPABASE_DB_URL")!, {
  prepare: false, max: 1, idle_timeout: 10, connect_timeout: 5,
});

function reply(status: number, body: object) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply(405, { error: "Method not allowed" });
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return reply(401, { error: "Sign in required" });

  try {
    const { data: { user }, error } = await auth.auth.getUser(token);
    if (error && ![400, 401, 403, 422].includes(error.status ?? 0)) throw error;
    if (!user?.id || error) return reply(401, { error: "Invalid session" });

    // Keep the identity and role scoped to this transaction, even on a pooled connection.
    // Querying Postgres directly avoids PostgREST rejecting the server JWT on clock skew.
    const games = await database.begin("read only", async (sql) => {
      await sql`set local role authenticated`;
      await sql`select set_config('request.jwt.claim.sub', ${user.id}, true)`;
      return await sql`
        select product_code, purchased_at
        from public.entitlements
        where user_id = ${user.id}::uuid
        order by purchased_at, product_code
      `;
    });
    return reply(200, { games });
  } catch (error) {
    const code = (error as { code?: string; name?: string })?.code ?? (error as Error)?.name;
    console.error("Date Night purchase lookup failed", code);
    return reply(502, { error: "Purchase lookup unavailable" });
  }
});
