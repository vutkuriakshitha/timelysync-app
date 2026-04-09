const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const BUILD_DIR = path.join(__dirname, "build");
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const isCustomEnhancement = path.basename(filePath) === "timelysync-enhancements.js";
    const configScript =
      `<script>window.__TIMELYSYNC_API_BASE__=${JSON.stringify(API_BASE_URL)};</script>`;
    const responseBody =
      extension === ".html"
        ? data.toString("utf8").replace("</head>", `${configScript}</head>`)
        : data;

    res.writeHead(200, {
      "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" || extension === ".js" || extension === ".css" || isCustomEnhancement
        ? "no-store, no-cache, must-revalidate"
        : "public, max-age=31536000"
    });
    res.end(responseBody);
  });
}

http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const sanitizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const candidatePath = path.normalize(path.join(BUILD_DIR, sanitizedPath));

  if (!candidatePath.startsWith(BUILD_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(candidatePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, candidatePath);
      return;
    }

    sendFile(res, path.join(BUILD_DIR, "index.html"));
  });
}).listen(PORT, () => {
  console.log(`TimelySync frontend running at http://localhost:${PORT}`);
});
