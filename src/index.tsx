import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    
    "/workers/fragments.worker.js": {
      async GET() {
        const workerPath = "node_modules/@thatopen/fragments/dist/worker/worker.mjs";
        const file = Bun.file(workerPath);
        if (!(await file.exists())) {
          return new Response("Worker not found", { status: 404 });
        }

        return new Response(file, {
          headers: {
            "Content-Type": "application/javascript",
          },
        });
      },
    },

    // 🌐 Tus APIs
    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // ⚠️ ¡OJO! Esta línea va al final, para no pisar otras rutas
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
