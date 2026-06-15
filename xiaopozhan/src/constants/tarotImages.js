/** 韦特塔罗牌面图（Rider-Waite，GitHub 公开资源） */
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

const SUIT_PREFIX = {
  wands: "Wands",
  cups: "Cups",
  swords: "Swords",
  pentacles: "Pents",
};

const RANK_NUM = {
  ace: "01",
  "2": "02",
  "3": "03",
  "4": "04",
  "5": "05",
  "6": "06",
  "7": "07",
  "8": "08",
  "9": "09",
  "10": "10",
  page: "11",
  knight: "12",
  queen: "13",
  king: "14",
};

const MINOR_OVERRIDES = {
  wands_9: "Tarot_Nine_of_Wands.jpg",
};

/** 本地缓存路径（若已运行 scripts/download-tarot-images.mjs） */
export function getLocalTarotImage(cardId) {
  return `/tarot/${cardId}.jpg`;
}

export function getTarotImageUrl(cardId) {
  if (MINOR_OVERRIDES[cardId]) {
    return BASE + encodeURI(MINOR_OVERRIDES[cardId]);
  }
  if (MAJOR_FILES[cardId]) {
    return BASE + encodeURI(MAJOR_FILES[cardId]);
  }
  const [suit, rank] = cardId.split("_");
  const prefix = SUIT_PREFIX[suit];
  const num = RANK_NUM[rank];
  if (prefix && num) {
    return `${BASE}${prefix}${num}.jpg`;
  }
  return "";
}

/** 优先本地，失败时用远程 */
export function resolveTarotImage(cardId) {
  return getLocalTarotImage(cardId);
}

export function resolveTarotImageFallback(cardId) {
  return getTarotImageUrl(cardId);
}
