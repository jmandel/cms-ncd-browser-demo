import { extname, resolve } from "node:path";

const rootDir = resolve(import.meta.dir);
const publicDir = resolve(rootDir, "public");
const port = Number(process.env.PORT ?? 3001);

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
        : extension === ".json"
          ? "application/json; charset=utf-8"
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

    const staticResponse = await serveStatic(url.pathname);
    if (staticResponse) {
      return staticResponse;
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
});

console.log(`Codex static preview at http://localhost:${port}`);
