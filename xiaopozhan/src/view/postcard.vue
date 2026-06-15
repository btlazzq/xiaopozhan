<template>
  <div class="postcard-page">
    <div class="inner_box">
      <div
        class="title"
        @click="backToPage"
      >
        <div class="title_l"></div>
        <div class="title_r"></div>
      </div>

      <div
        v-if="loading"
        class="status-text"
      >加载中...</div>
      <div
        v-else-if="!activity"
        class="status-text"
      >当前没有进行中的明信片活动</div>

      <template v-else>
        <div class="page-name">{{ activity.name }}</div>
        <div class="page-hint">制作你的专属明信片，最多 {{ textLimit }} 字</div>

        <div class="canvas-wrap">
          <canvas
            ref="canvasRef"
            :width="canvasW"
            :height="canvasH"
            @mousedown="startDraw"
            @mousemove="draw"
            @mouseup="stopDraw"
            @mouseleave="stopDraw"
            @touchstart.prevent="startDrawTouch"
            @touchmove.prevent="drawTouch"
            @touchend="stopDraw"
          />
        </div>

        <div class="tool-section">
          <label class="tool-label">祝福语</label>
          <textarea
            v-model="text"
            class="tool-textarea"
            :maxlength="textLimit"
            rows="2"
            placeholder="写点什么..."
            @input="redraw"
          />
          <div class="char-count">{{ text.length }}/{{ textLimit }}</div>
        </div>

        <div
          v-if="config.enableSticker"
          class="tool-section"
        >
          <label class="tool-label">贴图</label>
          <div class="sticker-list">
            <button
              v-for="(s, i) in defaultStickers"
              :key="i"
              class="sticker-btn"
              @click="addSticker(s.emoji)"
            >{{ s.emoji }}</button>
          </div>
        </div>

        <div
          v-if="config.enableDraw"
          class="tool-section"
        >
          <label class="tool-label">画笔</label>
          <div class="draw-tools">
            <input
              type="color"
              v-model="drawColor"
            />
            <input
              type="range"
              v-model="drawSize"
              min="1"
              max="10"
            />
            <button
              class="tool-btn"
              @click="eraser = !eraser"
            >{{ eraser ? '画笔' : '橡皮' }}</button>
            <button
              class="tool-btn"
              @click="clearDraw"
            >清除涂鸦</button>
          </div>
        </div>

        <div class="tool-actions">
          <button
            class="action-btn primary"
            :disabled="generating"
            @click="generate"
          >{{ generating ? '生成中...' : '生成明信片' }}</button>
          <button
            v-if="exportedUrl"
            class="action-btn"
            @click="download"
          >下载 PNG</button>
        </div>

        <div
          v-if="toast"
          class="toast"
        >{{ toast }}</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import { ref, computed, onMounted, nextTick } from "vue";
import {
  getCurrentActivity,
  submitActivityWork,
  getDeviceId
} from "@/api";

const canvasRef = ref(null);
const canvasW = 335;
const canvasH = 420;
const activity = ref(null);
const loading = ref(true);
const text = ref("");
const generating = ref(false);
const exportedUrl = ref("");
const toast = ref("");

const drawColor = ref("#6457b6");
const drawSize = ref(3);
const eraser = ref(false);
const isDrawing = ref(false);
const drawPaths = ref([]);

const defaultStickers = [
  { emoji: "❤️" }, { emoji: "⭐" }, { emoji: "🌸" }, { emoji: "🎵" },
  { emoji: "✨" }, { emoji: "🌙" }, { emoji: "🎁" }, { emoji: "💫" }
];
const placedStickers = ref([]);

const config = computed(() => activity.value?.config || {});
const textLimit = computed(() => config.value.textLimit || 30);

function initCanvas() {
  const ctx = canvasRef.value?.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.strokeStyle = "#6457b6";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, canvasW - 32, canvasH - 32);
}

function getPos(e) {
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasW / rect.width;
  const scaleY = canvasH / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function startDraw(e) {
  if (!config.value.enableDraw) return;
  isDrawing.value = true;
  const pos = getPos(e);
  drawPaths.value.push({
    color: eraser.value ? "#f5f0e8" : drawColor.value,
    size: drawSize.value,
    points: [pos]
  });
}

function draw(e) {
  if (!isDrawing.value) return;
  const pos = getPos(e);
  const path = drawPaths.value[drawPaths.value.length - 1];
  path.points.push(pos);
  redraw();
}

function stopDraw() {
  isDrawing.value = false;
}

function startDrawTouch(e) {
  const touch = e.touches[0];
  startDraw({ clientX: touch.clientX, clientY: touch.clientY });
}

function drawTouch(e) {
  const touch = e.touches[0];
  draw({ clientX: touch.clientX, clientY: touch.clientY });
}

function redraw() {
  initCanvas();
  const ctx = canvasRef.value.getContext("2d");

  for (const path of drawPaths.value) {
    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < path.points.length; i++) {
      const p = path.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  for (const s of placedStickers.value) {
    ctx.font = `${s.size}px serif`;
    ctx.fillText(s.emoji, s.x, s.y);
  }

  if (text.value) {
    ctx.fillStyle = "#333";
    ctx.font = "16px Courier New, monospace";
    ctx.textAlign = "center";
    const lines = wrapText(ctx, text.value, canvasW - 64);
    const startY = canvasH - 72 - lines.length * 22;
    lines.forEach((line, i) => ctx.fillText(line, canvasW / 2, startY + i * 26));
    ctx.textAlign = "left";
  }
}

function wrapText(ctx, t, maxWidth) {
  const chars = t.split("");
  const lines = [];
  let line = "";
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = ch;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function addSticker(emoji) {
  placedStickers.value.push({
    emoji,
    x: 80 + Math.random() * 160,
    y: 80 + Math.random() * 160,
    size: 28
  });
  redraw();
}

function clearDraw() {
  drawPaths.value = [];
  redraw();
}

async function generate() {
  generating.value = true;
  redraw();
  await nextTick();
  const url = canvasRef.value.toDataURL("image/png");
  exportedUrl.value = url;

  try {
    await submitActivityWork(activity.value.id, {
      text: text.value,
      sticker_data: placedStickers.value,
      draw_data: drawPaths.value,
      image_url: url,
      device_id: getDeviceId()
    });
    toast.value = "明信片已生成并保存";
  } catch (e) {
    toast.value = e.message.includes("设备")
      ? e.message
      : "明信片已生成（" + e.message + "）";
  }
  setTimeout(() => { toast.value = ""; }, 3000);
  generating.value = false;
}

function download() {
  const a = document.createElement("a");
  a.href = exportedUrl.value;
  a.download = `postcard_${Date.now()}.png`;
  a.click();
}

const backToPage = () => {
  router.back();
};

onMounted(async () => {
  try {
    const data = await getCurrentActivity();
    activity.value = data.activity;
  } catch { /* ignore */ }
  loading.value = false;
  await nextTick();
  initCanvas();
});
</script>

<style>
.postcard-page {
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.postcard-page .inner_box {
  width: 4.23rem;
  position: relative;
  margin: 0 auto;
  box-sizing: border-box;
  color: #fff;
  min-height: 100vh;
  background-color: #000;
  padding-top: 1.2rem;
  padding-bottom: 0.4rem;
}

.postcard-page .title_l {
  background: url(~@/assets/comment_wall/qi.png) no-repeat;
  left: 0;
  top: 0;
  height: 1.07rem;
  background-size: contain;
  position: absolute;
  z-index: 10;
  width: 1.14rem;
}

.postcard-page .title_r {
  background: url(~@/assets/comment_wall/qi2.png) no-repeat;
  z-index: 10;
  width: 1.14rem;
  height: 1.07rem;
  background-size: contain;
  position: absolute;
  right: 0;
  top: 0;
}

.postcard-page .status-text {
  text-align: center;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.2rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 1rem 0.25rem;
}

.postcard-page .page-name {
  text-align: center;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
  font-size: 0.26rem;
  color: #ff8538;
  margin-bottom: 0.1rem;
}

.postcard-page .page-hint {
  text-align: center;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.16rem;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.2rem;
}

.postcard-page .canvas-wrap {
  display: flex;
  justify-content: center;
  padding: 0 0.25rem;
  margin-bottom: 0.2rem;
}

.postcard-page canvas {
  width: 3.35rem;
  height: auto;
  border-radius: 2px;
  cursor: crosshair;
  touch-action: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.postcard-page .tool-section {
  padding: 0 0.25rem;
  margin-bottom: 0.18rem;
}

.postcard-page .tool-label {
  display: block;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.16rem;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.08rem;
}

.postcard-page .tool-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.18rem;
  padding: 0.1rem;
  box-sizing: border-box;
  resize: none;
}

.postcard-page .char-count {
  font-size: 0.14rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
  margin-top: 0.06rem;
}

.postcard-page .sticker-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.08rem;
}

.postcard-page .sticker-btn {
  font-size: 0.28rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.06rem 0.12rem;
  cursor: pointer;
}

.postcard-page .draw-tools {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  flex-wrap: wrap;
}

.postcard-page .draw-tools input[type="color"] {
  width: 0.36rem;
  height: 0.36rem;
  border: none;
  cursor: pointer;
}

.postcard-page .draw-tools input[type="range"] {
  flex: 1;
  min-width: 0.8rem;
}

.postcard-page .tool-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.14rem;
  padding: 0.06rem 0.1rem;
  cursor: pointer;
}

.postcard-page .tool-actions {
  display: flex;
  gap: 0.12rem;
  padding: 0 0.25rem;
  flex-wrap: wrap;
}

.postcard-page .action-btn {
  flex: 1;
  min-width: 1.2rem;
  height: 0.42rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.16rem;
  cursor: pointer;
}

.postcard-page .action-btn.primary {
  background: #6457b6;
  border-color: #6457b6;
}

.postcard-page .action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.postcard-page .toast {
  text-align: center;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.16rem;
  color: #ff8538;
  padding: 0.2rem 0.25rem;
}
</style>
