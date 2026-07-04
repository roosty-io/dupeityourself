import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { seedDemoData } from "./data/seed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "25mb" })); // image data URLs can be large

  await storage.init();
  await seedDemoData();

  registerRoutes(app);

  // serve the built client in production
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.resolve(__dirname, "public");
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  });

  app.listen(PORT, () => {
    console.log(`[dupe-it-yourself] server listening on http://localhost:${PORT}`);
    console.log(`[dupe-it-yourself] AI mode: ${process.env.USE_MOCK_AI === "false" ? process.env.AI_PROVIDER || "anthropic" : "mock"}`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
