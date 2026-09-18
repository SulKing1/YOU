import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mediaDir = path.join(root, "drawings", "media");
const publishedPath = path.join(root, "drawings", "published.json");
const IMAGE = /\.(png|jpe?g|gif|webp)$/i;

function prettyDrawingName(filename) {
  let base = String(filename || "").replace(/\.[^.]+$/, "");
  base = base.replace(/_\d+$/, "");
  base = base.replace(/([a-z])([A-Z])/g, "$1 $2");
  base = base.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  base = base.replace(/([0-9])([A-Z])/g, "$1 $2");
  base = base.replace(/\.+/g, ". ");
  base = base.replace(/[-_]+/g, " ");
  base = base.replace(/\s+/g, " ").trim();
  if (!base) {
    return filename;
  }
  return base.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
}

function readPublished() {
  try {
    const data = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
    return Array.isArray(data.drawings) ? data.drawings : [];
  } catch {
    return [];
  }
}

const media = fs
  .readdirSync(mediaDir)
  .filter((name) => IMAGE.test(name))
  .filter((name) => !name.startsWith("."))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

const previous = readPublished();
const seen = new Set();
const drawings = [];

for (const item of previous) {
  const filename = String(item.src || "").replace(/^\.\/media\//, "");
  if (!media.includes(filename)) {
    continue;
  }
  drawings.push({
    src: `./media/${filename}`,
    name: item.name || prettyDrawingName(filename),
  });
  seen.add(filename);
}

for (const filename of media) {
  if (seen.has(filename)) {
    continue;
  }
  drawings.push({
    src: `./media/${filename}`,
    name: prettyDrawingName(filename),
  });
}

const lines = drawings.map(
  (item) =>
    `    { "src": ${JSON.stringify(item.src)}, "name": ${JSON.stringify(item.name)} }`
);
fs.writeFileSync(
  publishedPath,
  `{\n  "drawings": [\n${lines.join(",\n")}\n  ]\n}\n`
);

console.log(`Wrote ${drawings.length} drawings to drawings/published.json`);
for (const item of drawings) {
  console.log(`  ${item.name}  ${item.src}`);
}
