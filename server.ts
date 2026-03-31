import { extname, resolve } from "node:path";

const rootDir = resolve(import.meta.dir);
const publicDir = resolve(rootDir, "public");
const modelPath = resolve(rootDir, "data", "obstructive-sleep-apnea.json");
const port = Number(process.env.PORT ?? 3001);

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function serveStatic(pathname: string) {
  const candidate = pathname === "/" ? "/index.html" : pathname;
  const resolved = resolve(publicDir, `.${candidate}`);

  if (!resolved.startsWith(publicDir)) {
    return null;
  }

  const file = Bun.file(resolved);
  if (!(await file.exists())) {
    return null;
  }

  const extension = extname(resolved);
  const contentType =
    extension === ".css"
      ? "text/css; charset=utf-8"
      : extension === ".js"
        ? "application/javascript; charset=utf-8"
        : "text/html; charset=utf-8";

  return new Response(file, {
    headers: {
      "Content-Type": contentType,
    },
  });
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/model") {
      const model = await Bun.file(modelPath).json();
      return json(model);
    }

    const staticResponse = await serveStatic(url.pathname);
    if (staticResponse) {
      return staticResponse;
    }

    return json({ error: "Not found" }, 404);
  },
});

console.log(`Codex prototype running at http://localhost:${port}`);
console.log(`Serving hand-authored model from ${modelPath}`);
