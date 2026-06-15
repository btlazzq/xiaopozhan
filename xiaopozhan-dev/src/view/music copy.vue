<template>

  <body id="v2025">
    <div class="page_music_box">
      <div class="page_music">
        <div
          class="back"
          v-if="showMusicBox"
        >
          <div
            class="btn_back"
            @click="router.push('/catalogue')"
          ></div>
        </div>
        <div
          class="music_box"
          v-if="showMusicBox"
        >
          <div class="shelfPage">
            <section
              v-for="(row, rowIdx) in videoShelfRows"
              :key="'video-row-' + rowIdx"
              class="shelfBlock shelfBlock--video"
            >
              <div class="shelfBlock__items">
                <div
                  class="shelfSlot shelfSlot--vhs"
                  v-for="slot in row"
                  :key="slot.item.id || slot.item.no"
                  :style="{ width: slot.width + 'rem' }"
                  @click="toPlayVideo(slot.item.no)"
                >
                  <VhsSpine
                    :item="slot.item"
                    :index="slot.index"
                  />
                </div>
              </div>
              <div class="shelfBlock__board" />
            </section>
            <section
              v-for="(row, rowIdx) in musicShelfRows"
              :key="'music-row-' + rowIdx"
              class="shelfBlock shelfBlock--music"
            >
              <div class="shelfBlock__items">
                <div
                  class="shelfSlot"
                  v-for="slot in row"
                  :key="slot.item.id || slot.item.no"
                  :style="{ width: slot.width + 'rem' }"
                  @click="toPlayMusic(slot.item.no)"
                >
                  <SpineTape
                    :item="slot.item"
                    :index="slot.index"
                  />
                </div>
              </div>
              <div class="shelfBlock__board" />
            </section>
          </div>
        </div>
        <div class="canvas_box">
          <canvas
            ref="canvas"
            class="cv"
          />
        </div>

        <div
          v-if="showContainer"
          style="position: fixed;top: 0;left: 0;width: 100vw;height: 100vh;display: flex;align-items: center;justify-content: center;z-index: 1000;background: transparent;"
        >
          <img
            :src="images[currentIndex]"
            alt=""
            style="max-width: 100vw;max-height: 100vh;width: auto;height: 100vh;display: block;"
          >
        </div>
      </div>

    </div>
  </body>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { getMusicList, getVideoList } from "@/api";
import SpineTape from "@/components/SpineTape.vue";
import VhsSpine from "@/components/VhsSpine.vue";
import { splitIntoShelfRows } from "@/constants/spineMaterials";

/** 音乐磁带位宽度（rem） */
const MUSIC_SHELF_WIDTHS = [
  0.32, 0.29, 0.33, 0.34, 0.32, 0.32, 0.45, 0.32, 0.32, 0.32, 0.32
];
const MUSIC_DEFAULT_WIDTH = 0.32;

/** 视频 VHS 位宽度（rem，略宽） */
const VIDEO_SHELF_WIDTHS = [0.43, 0.4, 0.43, 0.4, 0.43];
const VIDEO_DEFAULT_WIDTH = 0.42;

const router = useRouter();
const musicItems = ref([]);
const videoItems = ref([]);

function effectiveShelfSlot(item) {
  const title = String(item.title || "").toLowerCase();
  if (title === "intro") return 1;
  if (item.shelf_slot != null && item.shelf_slot > 0) return item.shelf_slot;
  return 9000 + (item.no || 0);
}

/** 书架顺序：intro 固定第 1 位，其余按 shelf_slot，再按 no */
const shelfMusicItems = computed(() => sortShelfItems(musicItems.value));
const shelfVideoItems = computed(() => sortShelfItems(videoItems.value));

function sortShelfItems(list) {
  return [...list].sort((a, b) => {
    const slotA = effectiveShelfSlot(a);
    const slotB = effectiveShelfSlot(b);
    if (slotA !== slotB) return slotA - slotB;
    return (a.no || 0) - (b.no || 0);
  });
}

const videoShelfRows = computed(() =>
  splitIntoShelfRows(
    shelfVideoItems.value,
    VIDEO_SHELF_WIDTHS,
    VIDEO_DEFAULT_WIDTH
  )
);

const musicShelfRows = computed(() =>
  splitIntoShelfRows(
    shelfMusicItems.value,
    MUSIC_SHELF_WIDTHS,
    MUSIC_DEFAULT_WIDTH
  )
);
const images = ref(
  importAll(
    require.context("@/assets/music/labubu/", false, /\.(png|jpe?g|svg)$/)
  )
);
const currentIndex = ref(0);
const showContainer = ref(true);
const timer = ref(null);
const showMusicBox = ref(false);
// 引用 canvas 元素
const canvas = ref(null);

function importAll(r) {
  return r.keys().map(r);
}

function startSlideshow() {
  setTimeout(() => {
    showMusicBox.value = true;
  }, 500);

  const totalImages = images.value.length;
  const displayTime = 50; // 3秒
  timer.value = setInterval(() => {
    currentIndex.value++;
    if (currentIndex.value >= totalImages) {
      clearInterval(timer.value);
      showContainer.value = false;
    }
  }, displayTime);
}

function toPlayVideo(e) {
  router.push("/videoTime?no=" + e);
}

function toPlayMusic(e) {
  router.push("/musicTime?no=" + e);
}

onBeforeUnmount(() => {
  // 组件销毁前清除定时器
  clearInterval(timer.value);
});

// 初始化样式
onMounted(async () => {
  try {
    const musicData = await getMusicList();
    const videoData = await getVideoList();
    musicItems.value = (musicData.items || []).filter((m) => m.no != null);
    videoItems.value = (videoData.items || []).filter((v) => v.no != null);
  } catch {
    musicItems.value = [];
    videoItems.value = [];
  }

  // 检测是否从特定页面返回
  const state = window.history.state || {};
  console.log(state);
  if (
    state.forward &&
    ["videoTime", "musicTime"].some((route) => state.forward.includes(route))
  ) {
    showMusicBox.value = true;
    showContainer.value = false;
  } else {
    startSlideshow();
  }
  const canvasEl = canvas.value; // 获取 canvas 元素
  const ctx = canvasEl.getContext("2d"); // 获取 2D 上下文
  const canvasWidth = canvasEl.width; // 画布宽度
  const canvasHeight = canvasEl.height; // 画布高度

  // 随机选择雪花或雨滴
  const isSnow = Math.random() > 0.5;

  let elements;
  if (isSnow) {
    elements = initSnowflakes(canvasWidth, canvasHeight, 30);
  } else {
    elements = initRaindrops(canvasWidth, canvasHeight, 20);
  }
  // 启动动画
  animate(ctx, canvasWidth, canvasHeight, elements, isSnow);
});

// 雪花类
class Snowflake {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth; // 随机 x 位置
    this.y = Math.random() * canvasHeight; // 随机 y 位置
    this.vx = Math.random() * 1 - 0.5; // 随机水平速度
    this.vy = Math.random(); // 随机垂直速度
    this.radius = Math.random() + 0.1; // 随机半径
    this.angle = Math.random() * 360; // 随机旋转角度
  }

  // 更新雪花位置
  snowUpdate(canvasWidth, canvasHeight) {
    this.x += this.vx; // 水平飘动
    this.y += this.vy; // 垂直下落
    this.angle += 0.2; // 旋转角度

    // 超出画布边界时重置位置
    if (this.y > canvasHeight) {
      this.y = -this.radius * 2; // 重置到顶部
      this.x = Math.random() * canvasWidth; // 随机 x 位置
    }
    if (this.x < 0 || this.x > canvasWidth) {
      this.x = Math.random() * canvasWidth; // 随机 x 位置
    }
  }

  // 绘制雪花
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 4); // 绘制圆形
    ctx.fillStyle = "rgba(255,255,255,0.34)"; // 雪花颜色
    ctx.fill();
  }
}

// 初始化雪花
const initSnowflakes = (canvasWidth, canvasHeight, count) => {
  const snowflakes = [];
  for (let i = 0; i < count; i++) {
    snowflakes.push(new Snowflake(canvasWidth, canvasHeight));
  }
  return snowflakes;
};

// 雨滴类
class Raindrop {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth; // 随机 x 位置
    this.y = Math.random() * canvasHeight; // 随机 y 位置
    this.vy = Math.random() + 0.1; // 随机下落速度
    this.length = Math.random() + 1; // 随机长度
  }

  // 更新雨滴位置
  rainUpdate(canvasHeight) {
    this.y += this.vy; // 向下移动
    if (this.y > canvasHeight) {
      this.y = -this.length; // 超出画布底部时重置到顶部
    }
  }

  // 绘制雨滴
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; // 雨滴颜色
    ctx.lineWidth = 0.5; // 雨滴宽度
    ctx.stroke();
  }
}

// 初始化雨滴
const initRaindrops = (canvasWidth, canvasHeight, count) => {
  const raindrops = [];
  for (let i = 0; i < count; i++) {
    raindrops.push(new Raindrop(canvasWidth, canvasHeight));
  }
  return raindrops;
};

// 动画循环
const animate = (ctx, canvasWidth, canvasHeight, elements, isSnow) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // 清除画布

  elements.forEach((element) => {
    if (isSnow) {
      element.snowUpdate(canvasWidth, canvasHeight); // 更新雪花位置
    } else {
      element.rainUpdate(canvasHeight); // 更新雨滴位置
    }
    element.draw(ctx);
  });
  requestAnimationFrame(() =>
    animate(ctx, canvasWidth, canvasHeight, elements, isSnow)
  ); // 下一帧
};

</script>

<style scoped>
/* 书架页：纯黑底 + 木架，无静态背景图 */
.shelfPage {
  width: 3.9rem;
  margin: 0 auto;
  padding: 0.45rem 0 0.5rem;
  background: #000;
  box-sizing: border-box;
}

.shelfBlock {
  position: relative;
  margin-bottom: 0.38rem;
}

.shelfBlock__items {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  justify-content: flex-start;
  height: 2.68rem;
  padding: 0 0.06rem 0.08rem;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
}

.shelfBlock--video .shelfBlock__items {
  height: 2.92rem;
}

.shelfBlock__board {
  height: 0.12rem;
  margin-top: -0.04rem;
  background: linear-gradient(
    180deg,
    #4a3c32 0%,
    #2a221c 55%,
    #1a1510 100%
  );
  box-shadow:
    0 0.04rem 0.1rem rgba(0, 0, 0, 0.55),
    inset 0 0.01rem 0 rgba(255, 255, 255, 0.06);
  border-radius: 0 0 0.02rem 0.02rem;
}

.shelfSlot {
  height: 2.52rem;
  flex-shrink: 0;
  cursor: pointer;
  box-sizing: border-box;
}

.shelfSlot--vhs {
  height: 2.76rem;
}

.btn_back {
  background-image: url(@/assets/music/back.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
  width: 0.4rem;
  background-position: bottom;
  opacity: 0.6;
  height: 0.4rem;
  margin-left: 0.2rem;
}

body {
  overflow-x: hidden;
}

.page_music_box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  user-select: none; /* 禁止文本选择 */
  -webkit-user-select: none; /* 兼容 WebKit 浏览器 */
  -moz-user-select: none; /* 兼容 Firefox */
  -ms-user-select: none; /* 兼容 IE */
}

.page_music {
  position: relative;
  min-height: 100vh;
  width: 4.23rem;
  margin: 0 auto;
  box-sizing: border-box;
  z-index: 1;
}

.back {
  width: 4.23rem;
  height: 0.72rem;
  margin: 0 auto 0.4rem;
  background-size: contain;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.music_box {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  overflow: visible;
  z-index: 2;
  position: relative;
  padding-top: 0.72rem;
  padding-bottom: 0.4rem;
}

.canvas_box {
  position: fixed;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  height: 100vh;
  width: 4.23rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
}

.cv {
  border: 0px;
  margin: 0px;
  padding: 0px;
  top: 0px;
  left: 0px;
  width: 4.23rem;
  height: 100vh;
}
</style>
