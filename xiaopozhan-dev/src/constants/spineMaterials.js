/** 书架磁带材质预设（与后端 spineMaterials.js 保持一致） */
export const SPINE_MATERIALS = {
  intro_red: {
    id: "intro_red",
    name: "Intro · 红底椭圆",
    decor: "oval",
    labelFont: "marker",
    labelColor: "#f8f4ec",
    paper: "linear-gradient(180deg, #d43030 0%, #b01818 55%, #881010 100%)",
  },
  intro_split: {
    id: "intro_split",
    name: "Intro · 蓝红拼色",
    split: true,
    defaultLeft: "#8ab8d4",
    defaultRight: "#c62828",
    labelFont: "marker",
    labelColor: "#fff8f0",
  },
  diary_blue: {
    id: "diary_blue",
    name: "日记 · 雾蓝",
    labelFont: "hand",
    labelColor: "#1a2838",
    paper:
      "linear-gradient(175deg, #9ec0d8 0%, #6a94b4 45%, #dce8f2 100%)",
    texture: "paper",
  },
  diary_cream: {
    id: "diary_cream",
    name: "日记 · 米黄",
    labelFont: "hand",
    labelColor: "#2c2620",
    paper: "linear-gradient(180deg, #f4ece0 0%, #d8cfc0 100%)",
    texture: "paper",
  },
  diary_white: {
    id: "diary_white",
    name: "日记 · 素白",
    labelFont: "hand",
    labelColor: "#333",
    paper: "linear-gradient(180deg, #faf8f4 0%, #e8e4dc 100%)",
    texture: "paper",
  },
  diary_gray: {
    id: "diary_gray",
    name: "日记 · 灰调",
    labelFont: "hand",
    labelColor: "#ece8e4",
    paper: "linear-gradient(165deg, #7a828a 0%, #4a525a 100%)",
    texture: "grain",
  },
  sky_fade: {
    id: "sky_fade",
    name: "天空 · 渐变",
    labelFont: "hand",
    labelColor: "#142838",
    paper:
      "radial-gradient(ellipse 85% 35% at 50% 12%, #e8f0f8 0%, transparent 55%), linear-gradient(180deg, #7aa8c8 0%, #5088a8 100%)",
    texture: "paper",
  },
  wood_dark: {
    id: "wood_dark",
    name: "深木 · 棕",
    labelFont: "hand",
    labelColor: "#e8e0d8",
    paper: "linear-gradient(120deg, #5a4038 0%, #2a2018 100%)",
    texture: "grain",
  },
  split_custom: {
    id: "split_custom",
    name: "拼色 · 自定义",
    split: true,
    defaultLeft: "#8ab4d4",
    defaultRight: "#e8dfd0",
    labelFont: "hand",
    labelColor: "#1a1814",
  },
  worn_red: {
    id: "worn_red",
    name: "旧红 · 褪色",
    labelFont: "hand",
    labelColor: "#fff0e8",
    paper: "linear-gradient(180deg, #b84848 0%, #883838 100%)",
    texture: "grain",
    category: "tape",
  },
  vhs_black: {
    id: "vhs_black",
    name: "VHS · 黑壳棕标",
    strip: "linear-gradient(180deg, #c8a878 0%, #a88858 45%, #886838 100%)",
    labelColor: "#f8f4ec",
    category: "vhs",
  },
  vhs_dark: {
    id: "vhs_dark",
    name: "VHS · 深棕标",
    strip: "linear-gradient(180deg, #6a5040 0%, #4a3828 100%)",
    labelColor: "#e8e0d8",
    category: "vhs",
  },
  vhs_faded: {
    id: "vhs_faded",
    name: "VHS · 褪色标",
    strip: "linear-gradient(180deg, #d8c8a8 0%, #b8a888 100%)",
    labelColor: "#2a2420",
    category: "vhs",
  },
};

export const VHS_MATERIALS = Object.fromEntries(
  Object.entries(SPINE_MATERIALS).filter(([, v]) => v.category === "vhs")
);

export function inferSpineMaterial(item) {
  if (item?.spine_material && SPINE_MATERIALS[item.spine_material]) {
    return item.spine_material;
  }
  const title = String(item?.title || "").toLowerCase();
  if (title === "intro") return "intro_red";
  if (/^intro\d/.test(title)) return "intro_split";
  const n = item?.no || item?.id || 0;
  const diary = ["diary_blue", "diary_cream", "diary_white", "diary_gray", "sky_fade"];
  return diary[n % diary.length];
}

export function formatSpineLabel(item) {
  const raw = (item?.spine_label || item?.title || "").trim();
  if (!raw) return "";
  const t = raw.replace(/月记/g, "日记");
  if (/^intro$/i.test(t)) return "intro";
  if (/^intro\d+$/i.test(t)) return t.toUpperCase();
  return t.replace(/\s*\/\s*/g, " / ");
}

export function getMaterial(item) {
  return SPINE_MATERIALS[inferSpineMaterial(item)] || SPINE_MATERIALS.diary_blue;
}

export function inferVhsMaterial(item) {
  if (item?.spine_material && VHS_MATERIALS[item.spine_material]) {
    return item.spine_material;
  }
  if (item?.spine_material && SPINE_MATERIALS[item.spine_material]) {
    return item.spine_material;
  }
  const n = item?.no || item?.id || 0;
  const keys = Object.keys(VHS_MATERIALS);
  return keys[n % keys.length] || "vhs_black";
}

export function getVhsMaterial(item) {
  const id = inferVhsMaterial(item);
  return VHS_MATERIALS[id] || VHS_MATERIALS.vhs_black;
}

export function computeShelfWidths(count, baseWidths, defaultW, maxTotal) {
  if (!count) return [];
  const raw = Array.from({ length: count }, (_, i) => baseWidths[i] ?? defaultW);
  const total = raw.reduce((s, w) => s + w, 0);
  if (total <= maxTotal) return raw;
  const scale = maxTotal / total;
  return raw.map((w) => Math.round(w * scale * 1000) / 1000);
}

/** 书架内容区可用宽度（rem），与 music.vue shelfPage 内边距一致 */
export const SHELF_INNER_WIDTH = 3.78;

/**
 * 按自然书脊宽度分行：一行放不下时自动新增下一层书架
 * @returns {Array<Array<{ item, width, index }>>}
 */
export function splitIntoShelfRows(items, baseWidths, defaultW, maxRowWidth = SHELF_INNER_WIDTH) {
  if (!items?.length) return [];
  const rows = [];
  let current = [];
  let rowTotal = 0;

  items.forEach((item, index) => {
    const width = baseWidths[index] ?? defaultW;
    if (current.length > 0 && rowTotal + width > maxRowWidth + 0.001) {
      rows.push(current);
      current = [];
      rowTotal = 0;
    }
    current.push({ item, width, index });
    rowTotal += width;
  });

  if (current.length) rows.push(current);
  return rows;
}

export function spineTilt(item, index) {
  const seed = ((item?.id || index + 1) * 7919 + 49297) % 233280;
  let deg = ((seed % 9) - 4) * 0.32;
  const extra = [-0.5, 0.2, -0.3, 0.4, -0.25, 0.15, 2, -1.4, 0.35, -0.2, 0.5, 0.1];
  deg += extra[index] ?? 0;
  return deg;
}
