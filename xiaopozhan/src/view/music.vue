<template>
  <body id="v2025">
    <div class="page_music_box">
      <div class="page_music">
        <div class="back" v-if="showMusicBox">
          <div class="btn_back" @click="router.push('/catalogue')"></div>
        </div>

        <div class="music_box" v-if="showMusicBox">
          <div class="shelfPage">
            <section
              v-for="(row, rowIdx) in videoShelfRows"
              :key="'video-row-' + rowIdx"
              class="shelfBlock shelfBlock--video"
            >
              <div class="shelfBlock__items">
                <div
                  class="shelfSlot shelfSlot--book shelfSlot--videoBook"
                  v-for="slot in row"
                  :key="slot.item.id || slot.item.no"
                  :style="{ width: slot.width + 'rem' }"
                  @click="toPlayVideo(slot.item.no)"
                >
                  <VhsSpine :item="slot.item" :index="slot.index" />
                </div>
              </div>
              <div class="shelfBlock__board"></div>
            </section>

            <section
              v-for="(row, rowIdx) in musicShelfRows"
              :key="'music-row-' + rowIdx"
              class="shelfBlock shelfBlock--music"
            >
              <div class="shelfBlock__items">
                <div
                  class="shelfSlot shelfSlot--book"
                  v-for="slot in row"
                  :key="slot.item.id || slot.item.no"
                  :style="{ width: slot.width + 'rem' }"
                  @click="toPlayMusic(slot.item.no)"
                >
                  <SpineTape :item="slot.item" :index="slot.index" />
                </div>
              </div>
              <div class="shelfBlock__board"></div>
            </section>
          </div>
        </div>

        <div class="canvas_box">
          <canvas ref="canvas" class="cv" />
        </div>

        <div v-if="showContainer" class="openingMask">
          <img :src="images[currentIndex]" alt="" class="openingImg" />
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

const MUSIC_SHELF_WIDTHS = [
  0.32, 0.31, 0.33, 0.32, 0.31, 0.34, 0.32, 0.31, 0.33, 0.32, 0.31
];
const MUSIC_DEFAULT_WIDTH = 0.32;

const VIDEO_SHELF_WIDTHS = [0.42, 0.41, 0.43, 0.41, 0.42];
const VIDEO_DEFAULT_WIDTH = 0.42;

const router = useRouter();
const musicItems = ref([]);
const videoItems = ref([]);

const images = ref(
  importAll(
    require.context("@/assets/music/labubu/", false, /\.(png|jpe?g|svg)$/)
  )
);

const currentIndex = ref(0);
const showContainer = ref(true);
const timer = ref(null);
const showMusicBox = ref(false);
const canvas = ref(null);
let animationId = null;

function importAll(r) {
  return r.keys().map(r);
}

function effectiveShelfSlot(item) {
  const title = String(item.title || "").toLowerCase();
  if (title === "intro") return 1;
  if (item.shelf_slot != null && item.shelf_slot > 0) return item.shelf_slot;
  return 9000 + (item.no || 0);
}

function sortShelfItems(list) {
  return [...list].sort((a, b) => {
    const slotA = effectiveShelfSlot(a);
    const slotB = effectiveShelfSlot(b);
    if (slotA !== slotB) return slotA - slotB;
    return (a.no || 0) - (b.no || 0);
  });
}

const shelfMusicItems = computed(() => sortShelfItems(musicItems.value));
const shelfVideoItems = computed(() => sortShelfItems(videoItems.value));

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

function startSlideshow() {
  setTimeout(() => {
    showMusicBox.value = true;
  }, 500);

  const totalImages = images.value.length;
  const displayTime = 50;

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

class Dust {
  constructor(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vy = Math.random() * 0.07 + 0.02;
    this.size = Math.random() * 0.7 + 0.18;
    this.alpha = Math.random() * 0.18 + 0.05;
  }

  update(width, height) {
    this.y += this.vy;
    this.x += Math.sin(this.y * 0.018) * 0.035;

    if (this.y > height) {
      this.y = -10;
      this.x = Math.random() * width;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(218, 193, 142, ${this.alpha})`;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function resizeCanvas(canvasEl) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvasEl.getBoundingClientRect();

  canvasEl.width = rect.width * dpr;
  canvasEl.height = rect.height * dpr;

  const ctx = canvasEl.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return {
    ctx,
    width: rect.width,
    height: rect.height
  };
}

function animateDust(ctx, width, height, dusts) {
  ctx.clearRect(0, 0, width, height);

  dusts.forEach((d) => {
    d.update(width, height);
    d.draw(ctx);
  });

  animationId = requestAnimationFrame(() =>
    animateDust(ctx, width, height, dusts)
  );
}

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

  const state = window.history.state || {};

  if (
    state.forward &&
    ["videoTime", "musicTime"].some((route) => state.forward.includes(route))
  ) {
    showMusicBox.value = true;
    showContainer.value = false;
  } else {
    startSlideshow();
  }

  const canvasEl = canvas.value;
  const { ctx, width, height } = resizeCanvas(canvasEl);
  const dusts = Array.from({ length: 36 }, () => new Dust(width, height));

  animateDust(ctx, width, height, dusts);
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<style scoped>
body {
  overflow-x: hidden;
}

.page_music_box {
  position: absolute;
  inset: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  background: #000;
  -webkit-overflow-scrolling: touch;
  user-select: none;
}

.page_music {
  position: relative;
  min-height: 100vh;
  width: 4.23rem;
  margin: 0 auto;
  box-sizing: border-box;
  z-index: 1;
  background:
    radial-gradient(circle at 48% 12%, rgba(218, 180, 108, 0.045), transparent 26%),
    #000;
}

.page_music::before {
  content: "";
  position: fixed;
  top: 0;
  left: 50%;
  width: 4.23rem;
  height: 100vh;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(0,0,0,.62), transparent 18%, transparent 82%, rgba(0,0,0,.62)),
    radial-gradient(circle at 50% 55%, transparent 38%, rgba(0,0,0,.28) 100%);
}

.page_music::after {
  content: "";
  position: fixed;
  top: 0;
  left: 50%;
  width: 4.23rem;
  height: 100vh;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 20;
  opacity: 0.075;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 0.035rem,
      rgba(255, 255, 255, 0.055) 0.037rem,
      transparent 0.04rem
    );
}

.back {
  width: 4.23rem;
  height: 0.72rem;
  margin: 0 auto 0.4rem;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.78), transparent);
}

.btn_back {
  background-image: url(@/assets/music/back.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
  width: 0.4rem;
  background-position: bottom;
  opacity: 0.7;
  height: 0.4rem;
  margin-left: 0.2rem;
  filter: sepia(0.6) brightness(1.08);
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

.shelfPage {
  width: 3.9rem;
  margin: 0 auto;
  padding: 0.42rem 0 0.55rem;
  background: #000;
  box-sizing: border-box;
}

.shelfBlock {
  position: relative;
  margin-bottom: 0.76rem;
}

.shelfBlock__items {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  justify-content: flex-start;
  height: 2.68rem;
  padding: 0 0.06rem 0.035rem;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
}

.shelfBlock--video .shelfBlock__items {
  height: 2.9rem;
}

.shelfSlot {
  height: 2.5rem;
  flex-shrink: 0;
  cursor: pointer;
  box-sizing: border-box;
  transition: transform 0.18s ease, filter 0.18s ease;
}

.shelfSlot:nth-child(2n) {
  transform: translateY(0.01rem);
}

.shelfSlot:nth-child(3n) {
  transform: translateY(-0.012rem) rotate(-0.25deg);
}

.shelfSlot:nth-child(5n) {
  transform: rotate(0.45deg);
}

.shelfSlot:hover {
  transform: translateY(-0.045rem) rotate(-0.45deg);
  filter: brightness(1.08);
}

.shelfSlot--videoBook {
  height: 2.76rem;
}

.shelfBlock__board {
  height: 0.23rem;
  margin-top: -0.035rem;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.78), transparent 9%, transparent 91%, rgba(0, 0, 0, 0.78)),
    linear-gradient(180deg, #5b3821 0%, #2a180d 52%, #060302 100%);
  box-shadow:
    0 0.06rem 0.22rem rgba(0, 0, 0, 0.92),
    inset 0 0.026rem 0 rgba(188, 124, 64, 0.24),
    inset 0 -0.04rem 0.09rem rgba(0, 0, 0, 0.82);
  border-radius: 0.008rem;
  position: relative;
}

.shelfBlock__board::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.72;
  background:
    repeating-linear-gradient(
      7deg,
      rgba(255, 207, 136, 0.075) 0,
      rgba(255, 207, 136, 0.075) 0.012rem,
      transparent 0.02rem,
      transparent 0.16rem
    ),
    repeating-linear-gradient(
      95deg,
      transparent 0,
      transparent 0.1rem,
      rgba(0,0,0,.24) 0.105rem,
      transparent 0.12rem
    );
}

.shelfBlock__board::after {
  content: "";
  position: absolute;
  left: 0.04rem;
  right: 0.04rem;
  bottom: -0.03rem;
  height: 0.045rem;
  background: rgba(0, 0, 0, 0.8);
  filter: blur(0.025rem);
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
  z-index: 5;
}

.cv {
  border: 0;
  margin: 0;
  padding: 0;
  width: 4.23rem;
  height: 100vh;
}

.openingMask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: #000;
}

.openingImg {
  max-width: 100vw;
  max-height: 100vh;
  width: auto;
  height: 100vh;
  display: block;
  filter: sepia(0.24) contrast(0.94) brightness(0.88);
}
</style>