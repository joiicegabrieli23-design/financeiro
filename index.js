const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/state") {
      try {
        await env.FINANCEIO_DB.prepare(`
          CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `).run();

        if (request.method === "GET") {
          const row = await env.FINANCEIO_DB
            .prepare("SELECT data, updated_at FROM app_state WHERE id = 1")
            .first();

          return json({
            data: row ? JSON.parse(row.data) : null,
            updated_at: row?.updated_at || null,
          });
        }

        if (request.method === "PUT") {
          const body = await request.json();
          if (!body || typeof body !== "object" || Array.isArray(body)) {
            return json({ ok: false, error: "Formato de dados inválido." }, 400);
          }

          const now = new Date().toISOString();
          await env.FINANCEIO_DB.prepare(`
            INSERT INTO app_state (id, data, updated_at)
            VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              data = excluded.data,
              updated_at = excluded.updated_at
          `).bind(JSON.stringify(body), now).run();

          return json({ ok: true, updated_at: now });
        }

        return json({ ok: false, error: "Método não permitido." }, 405);
      } catch (error) {
        return json({ ok: false, error: error?.message || String(error) }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
