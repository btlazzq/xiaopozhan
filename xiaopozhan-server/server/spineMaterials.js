/** 书架磁带 / 书脊材质预设（后台与前台共用定义） */
const SPINE_MATERIALS = {
  intro_red: {
    id: 'intro_red',
    name: 'Intro · 红底椭圆',
    desc: '红色壳 + 黑色椭圆，适合 intro',
    decor: 'oval',
    labelFont: 'marker',
    labelColor: '#f8f4ec',
    paper: 'linear-gradient(180deg, #d43030 0%, #b01818 55%, #881010 100%)',
  },
  intro_split: {
    id: 'intro_split',
    name: 'Intro · 蓝红拼色',
    desc: '上半浅蓝下半红，适合 intro2',
    split: true,
    defaultLeft: '#8ab8d4',
    defaultRight: '#c62828',
    labelFont: 'marker',
    labelColor: '#fff8f0',
    paper: null,
  },
  diary_blue: {
    id: 'diary_blue',
    name: '日记 · 雾蓝',
    desc: '淡蓝旧纸，手写风',
    labelFont: 'hand',
    labelColor: '#1a2838',
    paper: 'linear-gradient(175deg, #9ec0d8 0%, #6a94b4 45%, #dce8f2 100%)',
    texture: 'paper',
  },
  diary_cream: {
    id: 'diary_cream',
    name: '日记 · 米黄',
    desc: '泛黄纸页',
    labelFont: 'hand',
    labelColor: '#2c2620',
    paper: 'linear-gradient(180deg, #f4ece0 0%, #d8cfc0 100%)',
    texture: 'paper',
  },
  diary_white: {
    id: 'diary_white',
    name: '日记 · 素白',
    desc: '干净白底',
    labelFont: 'hand',
    labelColor: '#333',
    paper: 'linear-gradient(180deg, #faf8f4 0%, #e8e4dc 100%)',
    texture: 'paper',
  },
  diary_gray: {
    id: 'diary_gray',
    name: '日记 · 灰调',
    desc: '冷灰复古',
    labelFont: 'hand',
    labelColor: '#ece8e4',
    paper: 'linear-gradient(165deg, #7a828a 0%, #4a525a 100%)',
    texture: 'grain',
  },
  sky_fade: {
    id: 'sky_fade',
    name: '天空 · 渐变',
    desc: '云感淡蓝',
    labelFont: 'hand',
    labelColor: '#142838',
    paper:
      'radial-gradient(ellipse 85% 35% at 50% 12%, #e8f0f8 0%, transparent 55%), linear-gradient(180deg, #7aa8c8 0%, #5088a8 100%)',
    texture: 'paper',
  },
  wood_dark: {
    id: 'wood_dark',
    name: '深木 · 棕',
    desc: '深色木纹感',
    labelFont: 'hand',
    labelColor: '#e8e0d8',
    paper: 'linear-gradient(120deg, #5a4038 0%, #2a2018 100%)',
    texture: 'grain',
  },
  split_custom: {
    id: 'split_custom',
    name: '拼色 · 自定义',
    desc: '左右两色，可填自定义色值',
    split: true,
    defaultLeft: '#8ab4d4',
    defaultRight: '#e8dfd0',
    labelFont: 'hand',
    labelColor: '#1a1814',
    paper: null,
  },
  worn_red: {
    id: 'worn_red',
    name: '旧红 · 褪色',
    desc: '做旧红色',
    labelFont: 'hand',
    labelColor: '#fff0e8',
    paper: 'linear-gradient(180deg, #b84848 0%, #883838 100%)',
    texture: 'grain',
    category: 'tape',
  },
  vhs_black: {
    id: 'vhs_black',
    name: 'VHS · 黑壳棕标',
    desc: '经典 VHS 黑壳',
    strip: 'linear-gradient(180deg, #c8a878 0%, #a88858 45%, #886838 100%)',
    labelColor: '#f8f4ec',
    category: 'vhs',
  },
  vhs_dark: {
    id: 'vhs_dark',
    name: 'VHS · 深棕标',
    desc: '深色标签',
    strip: 'linear-gradient(180deg, #6a5040 0%, #4a3828 100%)',
    labelColor: '#e8e0d8',
    category: 'vhs',
  },
  vhs_faded: {
    id: 'vhs_faded',
    name: 'VHS · 褪色标',
    desc: '褪色旧标',
    strip: 'linear-gradient(180deg, #d8c8a8 0%, #b8a888 100%)',
    labelColor: '#2a2420',
    category: 'vhs',
  },
};

const SPINE_MATERIAL_LIST = Object.values(SPINE_MATERIALS);

function inferSpineMaterial(item) {
  if (item?.spine_material && SPINE_MATERIALS[item.spine_material]) {
    return item.spine_material;
  }
  const title = String(item?.title || '').toLowerCase();
  if (title === 'intro') return 'intro_red';
  if (/^intro\d/.test(title)) return 'intro_split';
  const n = item?.no || item?.id || 0;
  const diary = ['diary_blue', 'diary_cream', 'diary_white', 'diary_gray', 'sky_fade'];
  return diary[n % diary.length];
}

module.exports = { SPINE_MATERIALS, SPINE_MATERIAL_LIST, inferSpineMaterial };
