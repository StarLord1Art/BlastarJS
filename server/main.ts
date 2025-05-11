import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

const kv = await Deno.openKv();

serve(async (req) => {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/record") {
        const body = await req.json();

        const id = `${Date.now()}`;
        await kv.set(["records", id], body);

        return new Response("OK", {
            status: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            }
        });
    }

    if (req.method === "GET" && url.pathname === "/api/records") {
        // const param1 = url.searchParams.get("param1");
        // const param2 = Number(url.searchParams.get("param2"));

        const data:[{}] = [{}]

        for await (const entry of kv.list({ prefix: ["records"] }, { limit: 100 })) {
            data.push(entry.value)
        }

        return new Response(JSON.stringify(data), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            }
        });
    }

    return serveDir(req, {
        fsRoot: "client",
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
    });
})
