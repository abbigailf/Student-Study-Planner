import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  res.end(body);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
  };
  return map[ext] || "application/octet-stream";
}

const server = http.createServer(async (req, res) => {
  try {
    // ✅ API proxy endpoint (fixes CORS)
    if (req.url === "/api/quotes") {
      const apiRes = await fetch("https://type.fit/api/quotes");
      if (!apiRes.ok) {
        return send(res, 502, "Quotes API failed");
      }
      const data = await apiRes.text();

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        // Not required for same-origin, but safe:
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      });
      return res.end(data);
    }

    // Serve static files
    let reqPath = req.url === "/" ? "/index.html" : req.url;
    reqPath = reqPath.split("?")[0]; // remove query string

    const filePath = path.join(__dirname, reqPath);

    if (!filePath.startsWith(__dirname)) {
      return send(res, 403, "Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) return send(res, 404, "Not found");

      res.writeHead(200, {
        "Content-Type": contentType(filePath),
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  } catch (e) {
    console.error(e);
    send(res, 500, "Server error");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
