/** 韦特塔罗 78 张牌库 + 三张无牌阵抽牌 */

const MAJOR_ARCANA = [
  { id: 'major_0', num: 0, name: '愚者', nameEn: 'The Fool', upright: '新的开始、自由、冒险', reversed: '鲁莽、逃避、方向不明' },
  { id: 'major_1', num: 1, name: '魔术师', nameEn: 'The Magician', upright: '创造力、意志、资源齐备', reversed: '欺骗、才能浪费、犹豫' },
  { id: 'major_2', num: 2, name: '女祭司', nameEn: 'The High Priestess', upright: '直觉、潜意识、静观', reversed: '隐藏、压抑直觉、表面化' },
  { id: 'major_3', num: 3, name: '女皇', nameEn: 'The Empress', upright: '丰饶、滋养、感官享受', reversed: '依赖、创造力受阻、空虚' },
  { id: 'major_4', num: 4, name: '皇帝', nameEn: 'The Emperor', upright: '权威、结构、稳定', reversed: '控制欲、僵化、独断' },
  { id: 'major_5', num: 5, name: '教皇', nameEn: 'The Hierophant', upright: '传统、信仰、指导', reversed: '反叛、打破常规、个人信念' },
  { id: 'major_6', num: 6, name: '恋人', nameEn: 'The Lovers', upright: '选择、和谐、价值一致', reversed: '失衡、诱惑、关系裂痕' },
  { id: 'major_7', num: 7, name: '战车', nameEn: 'The Chariot', upright: '胜利、意志、前进', reversed: '失控、方向迷失、侵略' },
  { id: 'major_8', num: 8, name: '力量', nameEn: 'Strength', upright: '勇气、耐心、内在力量', reversed: '自我怀疑、软弱、失衡' },
  { id: 'major_9', num: 9, name: '隐者', nameEn: 'The Hermit', upright: '内省、独处、寻找答案', reversed: '孤立、退缩、拒绝帮助' },
  { id: 'major_10', num: 10, name: '命运之轮', nameEn: 'Wheel of Fortune', upright: '转机、周期、机遇', reversed: '厄运、抗拒变化、停滞' },
  { id: 'major_11', num: 11, name: '正义', nameEn: 'Justice', upright: '公平、因果、理性', reversed: '不公、逃避责任、偏见' },
  { id: 'major_12', num: 12, name: '倒吊人', nameEn: 'The Hanged Man', upright: '暂停、换角度、牺牲', reversed: '拖延、无谓牺牲、停滞' },
  { id: 'major_13', num: 13, name: '死神', nameEn: 'Death', upright: '结束、转变、重生', reversed: '抗拒改变、拖延、恐惧' },
  { id: 'major_14', num: 14, name: '节制', nameEn: 'Temperance', upright: '平衡、调和、耐心', reversed: '极端、失衡、缺乏耐心' },
  { id: 'major_15', num: 15, name: '恶魔', nameEn: 'The Devil', upright: '束缚、欲望、物质执念', reversed: '解脱、觉醒、打破枷锁' },
  { id: 'major_16', num: 16, name: '塔', nameEn: 'The Tower', upright: '突变、崩塌、真相揭露', reversed: '灾难延后、恐惧改变、压抑' },
  { id: 'major_17', num: 17, name: '星星', nameEn: 'The Star', upright: '希望、灵感、疗愈', reversed: '失望、信心不足、脱离现实' },
  { id: 'major_18', num: 18, name: '月亮', nameEn: 'The Moon', upright: '幻觉、潜意识、不确定', reversed: '恐惧消散、真相浮现、清晰' },
  { id: 'major_19', num: 19, name: '太阳', nameEn: 'The Sun', upright: '成功、活力、喜悦', reversed: '短暂阴云、过度乐观、延迟' },
  { id: 'major_20', num: 20, name: '审判', nameEn: 'Judgement', upright: '觉醒、召唤、复盘', reversed: '自我批判、拒绝召唤、拖延' },
  { id: 'major_21', num: 21, name: '世界', nameEn: 'The World', upright: '完成、整合、圆满', reversed: '未完成、延迟、缺乏闭环' },
];

const SUITS = [
  { id: 'wands', name: '权杖', nameEn: 'Wands', element: '火' },
  { id: 'cups', name: '圣杯', nameEn: 'Cups', element: '水' },
  { id: 'swords', name: '宝剑', nameEn: 'Swords', element: '风' },
  { id: 'pentacles', name: '星币', nameEn: 'Pentacles', element: '土' },
];

const RANKS = [
  { key: 'ace', name: 'Ace', label: '首牌' },
  { key: '2', name: '2', label: '二' },
  { key: '3', name: '3', label: '三' },
  { key: '4', name: '4', label: '四' },
  { key: '5', name: '5', label: '五' },
  { key: '6', name: '6', label: '六' },
  { key: '7', name: '7', label: '七' },
  { key: '8', name: '8', label: '八' },
  { key: '9', name: '9', label: '九' },
  { key: '10', name: '10', label: '十' },
  { key: 'page', name: 'Page', label: '侍从' },
  { key: 'knight', name: 'Knight', label: '骑士' },
  { key: 'queen', name: 'Queen', label: '皇后' },
  { key: 'king', name: 'King', label: '国王' },
];

const MINOR_THEMES = {
  wands: { upright: '行动、热情、创造', reversed: '冲动、耗竭、延迟' },
  cups: { upright: '情感、关系、直觉', reversed: '情绪失衡、逃避、冷淡' },
  swords: { upright: '思维、决断、沟通', reversed: '冲突、混乱、伤害' },
  pentacles: { upright: '物质、工作、稳定', reversed: '匮乏、固执、失衡' },
};

const POSITION_LABELS = [
  '万用牌阵第一张',
  '万用牌阵第二张',
  '万用牌阵第三张',
];

function buildMinorArcana() {
  const cards = [];
  for (const suit of SUITS) {
    const theme = MINOR_THEMES[suit.id];
    for (const rank of RANKS) {
      cards.push({
        id: `${suit.id}_${rank.key}`,
        arcana: 'minor',
        suit: suit.id,
        suitName: suit.name,
        suitEn: suit.nameEn,
        rank: rank.key,
        rankLabel: rank.label,
        name: `${suit.name}${rank.label}`,
        nameEn: `${rank.name} of ${suit.nameEn}`,
        upright: `${suit.name}·${theme.upright}`,
        reversed: `${suit.name}·${theme.reversed}`,
      });
    }
  }
  return cards;
}

function buildDeck() {
  return [
    ...MAJOR_ARCANA.map((c) => ({ ...c, arcana: 'major', suit: null })),
    ...buildMinorArcana(),
  ];
}

const FULL_DECK = buildDeck();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawThreeSpread() {
  const picked = shuffle(FULL_DECK).slice(0, 3);
  return picked.map((card, index) => {
    const reversed = Math.random() < 0.45;
    return {
      position: index + 1,
      positionLabel: POSITION_LABELS[index],
      id: card.id,
      name: card.name,
      nameEn: card.nameEn,
      arcana: card.arcana,
      suit: card.suit,
      suitName: card.suitName || null,
      num: card.num ?? null,
      reversed,
      orientation: reversed ? 'reversed' : 'upright',
      orientationLabel: reversed ? '逆位' : '正位',
      meaning: reversed ? card.reversed : card.upright,
    };
  });
}

module.exports = {
  FULL_DECK,
  drawThreeSpread,
  POSITION_LABELS,
};
