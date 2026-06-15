#!/usr/bin/env node
/**
 * 下载韦特塔罗牌图到 public/tarot/{cardId}.jpg
 * 用法: node scripts/download-tarot-images.mjs
 */
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT = path.join(__dirname, "../public/tarot");
const BASE =
  "https://raw.githubusercontent.com/dejagwentendu/Tarot-Cards-public/main/";

const MAJOR_FILES = {
  major_0: "RWS_Tarot_00_Fool.jpg",
  major_1: "RWS_Tarot_01_Magician.jpg",
  major_2: "RWS_Tarot_02_High_Priestess.jpg",
  major_3: "RWS_Tarot_03_Empress.jpg",
  major_4: "RWS_Tarot_04_Emperor.jpg",
  major_5: "RWS_Tarot_05_Hierophant.jpg",
  major_6: "RWS_Tarot_06_Lovers.jpg",
  major_7: "RWS_Tarot_07_Chariot.jpg",
  major_8: "RWS_Tarot_08_Strength.jpg",
  major_9: "RWS_Tarot_09_Hermit.jpg",
  major_10: "RWS_Tarot_10_Wheel_of_Fortune.jpg",
  major_11: "RWS_Tarot_11_Justice.jpg",
  major_12: "RWS_Tarot_12_Hanged_Man.jpg",
  major_13: "RWS_Tarot_13_Death.jpg",
  major_14: "RWS_Tarot_14_Temperance.jpg",
  major_15: "RWS_Tarot_15_Devil.jpg",
  major_16: "RWS_Tarot_16_Tower.jpg",
  major_17: "RWS_Tarot_17_Star (1).jpg",
  major_18: "RWS_Tarot_18_Moon.jpg",
  major_19: "RWS_Tarot_19_Sun.jpg",
  major_20: "RWS_Tarot_20_Judgement.jpg",
  major_21: "RWS_Tarot_21_World.jpg",
};

const SUIT_PREFIX = { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pents" };
const RANK_NUM = {
  ace: "01", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06", "7": "07",
  "8": "08", "9": "09", "10": "10", page: "11", knight: "12", queen: "13", king: "14",
};
const MINOR_OVERRIDES = { wands_9: "Tarot_Nine_of_Wands.jpg" };

function buildMap() {
  const map = { ...MAJOR_FILES };
  map.wands_9 = MINOR_OVERRIDES.wands_9;
  for (const suit of Object.keys(SUIT_PREFIX)) {
    for (const [rank, num] of Object.entries(RANK_NUM)) {
      const id = `${suit}_${rank}`;
      if (map[id]) continue;
      map[id] = `${SUIT_PREFIX[suit]}${num}.jpg`;
    }
  }
  return map;
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} ${url}`));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const map = buildMap();
  let ok = 0;
  for (const [id, file] of Object.entries(map)) {
    const url = BASE + encodeURI(file);
    const dest = path.join(OUT, `${id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      ok++;
      continue;
    }
    try {
      process.stdout.write(`↓ ${id} … `);
      const buf = await download(url);
      fs.writeFileSync(dest, buf);
      console.log("ok");
      ok++;
    } catch (e) {
      console.log("fail", e.message);
    }
  }
  console.log(`\n完成 ${ok}/${Object.keys(map).length} → ${OUT}`);
}

main();
