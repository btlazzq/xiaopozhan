<!--留言-->
<template>

  <body id="v2025">
    <div class="page_leaveWords_box">
      <div class="page_leaveWords">
        <div class="back">
          <div
            class="btn_back"
            @click="backToCatalogue"
          ></div>
          <div
            class="me"
            title="塔罗占卜"
            @click="toCommentWallPage"
          ></div>
        </div>

        <div class="compose-title">匿名留言</div>

        <div class="danmaku-stage">
          <div
            v-for="item in danmakuItems"
            :key="item.uid"
            class="danmaku-item"
            :style="danmakuStyle(item)"
          >{{ item.content }}</div>
        </div>

        <section class="compose-area">
          <div class="compose-paper">
            <div class="compose-paper__corner compose-paper__corner--tl" />
            <div class="compose-paper__corner compose-paper__corner--br" />
            <div class="compose-paper__lines" />
            <textarea
              v-model="inputContent"
              class="compose-input"
              placeholder="在纸上写点什么…"
              maxlength="300"
              :disabled="sending"
            />
          </div>
          <div class="compose-foot">
            <span class="compose-count">{{ inputContent.length }}/300</span>
            <button
              class="compose-send"
              :disabled="!inputContent.trim() || sending"
              @click="handleSend"
            >
              {{ sending ? "揉纸中…" : "揉成团 · 放飞" }}
            </button>
          </div>
          <p
            v-if="hintMsg"
            class="compose-hint"
            :class="{ 'compose-hint--err': hintError }"
          >{{ hintMsg }}</p>
        </section>

        <div class="view_box1">
          <video
            class="sprite_box"
            autoplay
            loop=""
            muted
            x5-playsinline="true"
            playsinline=""
            webkit-playsinline="true"
            x-webkit-airplay="true"
            x5-video-orientation="portraint"
            :src="videoSrc"
          ></video>
        </div>
      </div>

      <PaperPlaneFly
        :visible="flying"
        :text="flyText"
        @done="onFlyDone"
      />
    </div>

  </body>

</template>
<script setup>
import router from "@/router";
import { ref, onMounted, onBeforeUnmount } from "vue";
import PaperPlaneFly from "@/components/PaperPlaneFly.vue";
import { submitMessage, getPublicMessages } from "@/api";
import videoSrc from "@/assets/leave_words/shui.mp4";

const TRACK_COUNT = 6;
const danmakuItems = ref([]);
let danmakuUid = 0;

const inputContent = ref("");
const sending = ref(false);
const flying = ref(false);
const flyText = ref("");
const hintMsg = ref("");
const hintError = ref(false);
let submitPromise = null;

function danmakuStyle(item) {
  return {
    top: `${6 + item.track * 14}%`,
    animationDuration: `${item.duration}s`,
    animationDelay: `${item.delay}s`,
    color: item.color,
    fontSize: item.fontSize,
  };
}

function pushDanmaku(content, opts = {}) {
  const colors = [
    "rgba(255,255,255,0.92)",
    "rgba(255,200,160,0.95)",
    "rgba(200,220,255,0.9)",
    "rgba(255,230,180,0.92)",
    "rgba(220,255,220,0.88)",
  ];
  danmakuItems.value.push({
    uid: ++danmakuUid,
    content: content.length > 48 ? content.slice(0, 48) + "…" : content,
    track: opts.track ?? Math.floor(Math.random() * TRACK_COUNT),
    duration: opts.duration ?? 9 + Math.random() * 7,
    delay: opts.delay ?? Math.random() * 1.5,
    color: opts.color ?? colors[Math.floor(Math.random() * colors.length)],
    fontSize: opts.fontSize ?? `${0.14 + Math.random() * 0.04}rem`,
  });
  if (danmakuItems.value.length > 40) {
    danmakuItems.value.splice(0, danmakuItems.value.length - 40);
  }
}

async function loadDanmaku() {
  try {
    const data = await getPublicMessages();
    const items = data.items || [];
    items.slice(0, 20).forEach((msg, i) => {
      pushDanmaku(msg.content, {
        track: i % TRACK_COUNT,
        delay: i * 0.6,
        duration: 10 + (i % 5) * 1.2,
      });
    });
  } catch {
    /* ignore */
  }
}

let danmakuTimer = null;
function startDanmakuLoop() {
  danmakuTimer = setInterval(async () => {
    try {
      const data = await getPublicMessages();
      const items = data.items || [];
      if (items.length) {
        const msg = items[Math.floor(Math.random() * items.length)];
        pushDanmaku(msg.content);
      }
    } catch {
      /* ignore */
    }
  }, 8000);
}

onMounted(() => {
  loadDanmaku();
  startDanmakuLoop();
});

onBeforeUnmount(() => {
  if (danmakuTimer) clearInterval(danmakuTimer);
});

const backToCatalogue = () => router.push("/catalogue");
const toCommentWallPage = () => router.push("/commentWall");

function showHint(text, isError = false) {
  hintMsg.value = text;
  hintError.value = isError;
  setTimeout(() => {
    if (hintMsg.value === text) hintMsg.value = "";
  }, 3200);
}

const handleSend = () => {
  const text = inputContent.value.trim();
  if (!text || sending.value) return;

  sending.value = true;
  flyText.value = text;
  inputContent.value = "";
  flying.value = true;

  submitPromise = submitMessage(text)
    .then((res) => {
      pushDanmaku(text, { delay: 0, duration: 11 });
      showHint(res.message || "已飞出，右上角可进入塔罗占卜");
    })
    .catch((e) => {
      inputContent.value = text;
      showHint(e.message || "发送失败", true);
    });
};

async function onFlyDone() {
  flying.value = false;
  if (submitPromise) {
    await submitPromise;
    submitPromise = null;
  }
  sending.value = false;
}
</script>
<style>
* { margin: 0; padding: 0; }

.page_leaveWords_box {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.page_leaveWords {
  position: relative;
  height: 100vh;
  width: 4.23rem;
  margin: 0 auto;
  box-sizing: border-box;
  padding-top: 0.72rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.back {
  width: 4.23rem;
  height: 0.72rem;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.2rem;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.92) 70%, transparent);
}

.me {
  background: url(~@/assets/leave_words/icon/me.png) no-repeat center;
  width: 0.4rem;
  height: 0.4rem;
  background-size: contain;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.85;
}

.btn_back {
  background-image: url(~@/assets/music/back.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
  width: 0.4rem;
  height: 0.4rem;
  margin-left: 0;
  background-position: bottom;
  opacity: 0.6;
  cursor: pointer;
}

.compose-title {
  flex-shrink: 0;
  position: relative;
  z-index: 15;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
  font-size: 0.18rem;
  color: #ff8538;
  text-align: center;
  margin-bottom: 0.06rem;
}

.danmaku-stage {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  z-index: 10;
  pointer-events: none;
}

.danmaku-item {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  font-family: "Courier New", Courier, monospace;
  text-shadow:
    0 0.01rem 0.03rem rgba(0, 0, 0, 0.85),
    0 0 0.06rem rgba(0, 0, 0, 0.5);
  animation: danmaku-run linear forwards;
  will-change: transform;
}

@keyframes danmaku-run {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - 4.5rem)); }
}

.compose-area {
  flex-shrink: 0;
  position: relative;
  z-index: 20;
  padding: 0 0.2rem 0.12rem;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.55) 35%, rgba(0, 0, 0, 0.85) 100%);
}

.compose-paper {
  position: relative;
  height: 1.35rem;
  padding: 0.12rem 0.16rem;
  box-sizing: border-box;
  background: linear-gradient(165deg, #fffef8 0%, #f3ebe0 50%, #e8dfd0 100%);
  box-shadow:
    0 0.04rem 0.16rem rgba(0, 0, 0, 0.28),
    inset 0 0.01rem 0 rgba(255, 255, 255, 0.85);
  border: 0.01rem solid rgba(90, 75, 55, 0.12);
  border-radius: 0.02rem;
}

.compose-paper__lines {
  position: absolute;
  inset: 0.1rem 0.12rem;
  background: repeating-linear-gradient(
    transparent,
    transparent 0.27rem,
    rgba(100, 80, 60, 0.09) 0.28rem
  );
  pointer-events: none;
}

.compose-paper__corner {
  position: absolute;
  width: 0.22rem;
  height: 0.22rem;
  opacity: 0.35;
}

.compose-paper__corner--tl {
  top: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.08), transparent 55%);
}

.compose-paper__corner--br {
  bottom: 0;
  right: 0;
  background: linear-gradient(-45deg, rgba(0, 0, 0, 0.06), transparent 55%);
}

.compose-input {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;
  border: none;
  color: #2a2420;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.16rem;
  padding: 0.04rem 0.02rem;
  box-sizing: border-box;
  resize: none;
  line-height: 0.28rem;
}

.compose-input:focus { outline: none; }
.compose-input::placeholder { color: rgba(60, 50, 40, 0.35); }
.compose-input:disabled { opacity: 0.55; }

.compose-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.1rem;
}

.compose-count {
  font-size: 0.12rem;
  color: rgba(255, 255, 255, 0.45);
  font-family: "Courier New", Courier, monospace;
}

.compose-send {
  padding: 0.08rem 0.22rem;
  border: 0.01rem solid #ff8538;
  background: rgba(255, 133, 56, 0.15);
  color: #ff8538;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
  font-size: 0.15rem;
  cursor: pointer;
}

.compose-send:disabled { opacity: 0.45; cursor: not-allowed; }

.compose-hint {
  margin-top: 0.08rem;
  font-size: 0.12rem;
  color: rgba(255, 133, 56, 0.9);
  text-align: center;
  font-family: "Courier New", Courier, monospace;
}

.compose-hint--err { color: #ff6b6b; }

.view_box1 {
  flex-shrink: 0;
  width: 100%;
  background: #6457b6;
  z-index: 5;
  height: 2.6rem;
}

.sprite_box {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
</style>
