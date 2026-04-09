const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "src", "enhancements", "source");
const outputFile = path.join(projectRoot, "build", "static", "js", "timelysync-enhancements.js");

function getSourceFiles(dir) {
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".js"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function buildBundle() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  const files = getSourceFiles(sourceDir);
  if (!files.length) {
    throw new Error(`No enhancement source files found in: ${sourceDir}`);
  }

  const parts = files.map((file) => {
    const filePath = path.join(sourceDir, file);
    return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  });

  const bundle = `${parts.join("\n")}\n`;
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, bundle, "utf8");

  console.log(`Built ${path.relative(projectRoot, outputFile)} from ${files.length} source modules.`);
}

buildBundle();
