import { Jimp } from "jimp";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = path.resolve(import.meta.dirname, "..");
const webpBg = path.join(root, "src/assets/music/music-bg.png");
const decoded = path.join(root, "src/assets/music/music-bg-decoded.png");
try {
  execSync(
    `sips -s format png "${webpBg}" --out "${decoded}"`,
    { stdio: "ignore" }
  );
} catch {
  console.error("需要 macOS sips 将 music-bg.png 转为 PNG");
  process.exit(1);
}
const src = decoded;
const outDir = path.join(root, "src/assets/music/tapes");
fs.mkdirSync(outDir, { recursive: true });

/** 1080x1920 背景图上中间一排磁带的大致 x 边界 */
const TAPE_X = [
  [28, 106],
  [106, 180],
  [180, 262],
  [262, 348],
  [348, 430],
  [430, 512],
  [512, 608],
  [608, 692],
  [692, 776],
  [776, 860],
  [860, 948],
];
const Y_TOP = 698;
const Y_BOTTOM = 1168;

const img = await Jimp.read(src);

for (let i = 0; i < TAPE_X.length; i++) {
  const [x0, x1] = TAPE_X[i];
  const tape = img.clone().crop({ x: x0, y: Y_TOP, w: x1 - x0, h: Y_BOTTOM - Y_TOP });
  await tape.write(path.join(outDir, `spine-${String(i + 1).padStart(2, "0")}.png`));
}

// 塑料壳边缘参考（略宽一点）
const shell = img.clone().crop({ x: 28, y: Y_TOP, w: 78, h: Y_BOTTOM - Y_TOP });
await shell.write(path.join(outDir, "shell-ref.png"));

const top = img.clone().crop({ x: 0, y: 0, w: 1080, h: Y_TOP });
await top.write(path.join(root, "src/assets/music/music-bg-top.png"));

const bottom = img.clone().crop({ x: 0, y: Y_BOTTOM, w: 1080, h: 1920 - Y_BOTTOM });
await bottom.write(path.join(root, "src/assets/music/music-bg-bottom.png"));

console.log("cropped", TAPE_X.length, "spines to", outDir);
