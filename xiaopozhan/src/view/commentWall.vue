<template>
  <div class="commentWallBox">
    <div class="page_tarot">
      <div class="back">
        <div
          class="btn_back"
          @click="backToPage"
        ></div>
      </div>

      <div class="inner_box">

        <div class="tarot-page">
          <h1 class="tarot-page__title">三张牌解析法</h1>
          <p class="tarot-page__desc">适合综合分析 · 单事解析 · 万用牌阵</p>
          <p class="tarot-page__deck-name">韦特塔罗 · 无牌阵三张</p>

          <section
            v-if="!reading"
            class="tarot-ask"
          >
            <label class="tarot-ask__label">请输入你想占卜的问题</label>
            <textarea
              v-model="question"
              class="tarot-ask__input"
              placeholder="请专注问题，并保持静心…"
              maxlength="200"
              :disabled="drawing"
            />
            <p class="tarot-ask__count">{{ question.length }}/200</p>
            <button
              class="tarot-start-btn"
              :disabled="!question.trim() || drawing"
              @click="startReading"
            >
              {{ drawing ? "洗牌抽牌中…" : "开始抽牌" }}
            </button>
            <p
              v-if="errorMsg"
              class="tarot-error"
            >{{ errorMsg }}</p>
          </section>

          <section
            v-else
            class="tarot-reading"
          >
            <div class="tarot-reading__question">
              <span class="tarot-reading__q-label">所问之事</span>
              <p>{{ reading.question }}</p>
            </div>

            <div
              class="tarot-spread"
              :class="{ 'tarot-spread--dealing': dealing }"
            >
              <div
                v-for="(card, idx) in reading.cards"
                :key="card.id + idx"
                class="tarot-slot"
              >
                <p class="tarot-slot__pos">{{ card.positionLabel }}</p>
                <div
                  class="tarot-flip"
                  :class="{ 'tarot-flip--show': revealed[idx] }"
                >
                  <div class="tarot-flip__inner">
                    <div class="tarot-flip__back">
                      <span class="tarot-flip__moon">☽</span>
                    </div>
                    <div class="tarot-flip__front">
                      <img
                        class="tarot-flip__img"
                        :class="{ 'tarot-flip__img--rev': card.reversed }"
                        :src="cardImage(card.id)"
                        :alt="card.name"
                        @error="onImgError($event, card.id)"
                      >
                    </div>
                  </div>
                </div>
                <div
                  v-if="revealed[idx]"
                  class="tarot-slot__info"
                >
                  <strong class="tarot-slot__name">{{ card.name }}</strong>
                  <span
                    class="tarot-slot__ori"
                    :class="{ 'tarot-slot__ori--rev': card.reversed }"
                  >{{ card.orientationLabel }}</span>
                  <p class="tarot-slot__meaning">{{ card.meaning }}</p>
                </div>
              </div>
            </div>

            <div class="tarot-reading__actions">
              <button
                class="tarot-start-btn tarot-start-btn--ghost"
                @click="resetReading"
              >重新占卜</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import { ref } from "vue";
import { drawTarotSpread } from "@/api";
import {
  resolveTarotImage,
  resolveTarotImageFallback,
} from "@/constants/tarotImages";

const question = ref("");
const reading = ref(null);
const drawing = ref(false);
const dealing = ref(false);
const revealed = ref([false, false, false]);
const errorMsg = ref("");

function cardImage(cardId) {
  return resolveTarotImage(cardId);
}

function onImgError(e, cardId) {
  const fb = resolveTarotImageFallback(cardId);
  if (fb && e.target.src !== fb) {
    e.target.src = fb;
  }
}

async function startReading() {
  const q = question.value.trim();
  if (!q || drawing.value) return;
  errorMsg.value = "";
  drawing.value = true;
  dealing.value = true;
  revealed.value = [false, false, false];
  reading.value = null;

  try {
    const data = await drawTarotSpread(q);
    reading.value = { question: data.question, cards: data.cards };
    dealing.value = false;
    data.cards.forEach((_, i) => {
      setTimeout(() => {
        const next = [...revealed.value];
        next[i] = true;
        revealed.value = next;
      }, 400 + i * 450);
    });
  } catch (e) {
    errorMsg.value = e.message || "抽牌失败";
    dealing.value = false;
  }
  drawing.value = false;
}

function resetReading() {
  reading.value = null;
  revealed.value = [false, false, false];
  errorMsg.value = "";
}

const backToPage = () => router.push("/leaveWords");
</script>

<style>
.commentWallBox {
  position: absolute;
  inset: 0;
  background: #000;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.page_tarot {
  position: relative;
  width: 4.23rem;
  min-height: 100vh;
  margin: 0 auto;
  box-sizing: border-box;
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
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.92) 70%, transparent);
}

.btn_back {
  background-image: url(~@/assets/music/back.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
  width: 0.4rem;
  height: 0.4rem;
  margin-left: 0.2rem;
  background-position: bottom;
  opacity: 0.6;
  cursor: pointer;
}

.inner_box {
  width: 4.23rem;
  margin: 0 auto;
  min-height: 100vh;
  padding: 0.68rem 0.16rem 0.48rem;
  box-sizing: border-box;
  position: relative;
}

.title-deco {
  position: relative;
  height: 1.07rem;
  margin-bottom: 0.05rem;
}

.title_l {
  background: url(~@/assets/comment_wall/qi.png) no-repeat;
  left: 0;
  top: 0;
  height: 1.07rem;
  background-size: contain;
  position: absolute;
  z-index: 10;
  width: 1.14rem;
}

.title_r {
  background: url(~@/assets/comment_wall/qi2.png) no-repeat;
  z-index: 10;
  width: 1.14rem;
  height: 1.07rem;
  background-size: contain;
  position: absolute;
  right: 0;
  top: 0;
}

.tarot-page {
  text-align: center;
  position: relative;
  z-index: 1;
}

.tarot-page__title {
  margin: 0;
  font-family: "Ma Shan Zheng", cursive;
  font-size: 0.28rem;
  font-weight: normal;
  color: #e8d8b8;
  letter-spacing: 0.04rem;
}

.tarot-page__desc {
  margin: 0.06rem 0 0;
  font-size: 0.12rem;
  color: rgba(200, 168, 120, 0.55);
  font-family: "Courier New", Courier, monospace;
}

.tarot-page__deck-name {
  margin: 0.1rem 0 0.16rem;
  font-size: 0.14rem;
  color: #c8a878;
  letter-spacing: 0.06rem;
}

.tarot-ask { padding: 0 0.02rem; }

.tarot-ask__label {
  display: block;
  font-size: 0.14rem;
  color: rgba(232, 216, 184, 0.75);
  margin-bottom: 0.1rem;
  font-family: "Courier New", Courier, monospace;
}

.tarot-ask__input {
  width: 100%;
  min-height: 1.1rem;
  padding: 0.12rem;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.05);
  border: 0.01rem solid rgba(200, 168, 120, 0.35);
  color: #f0ece4;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.16rem;
  line-height: 1.55;
  resize: none;
}

.tarot-ask__input:focus {
  outline: none;
  border-color: #c8a878;
}

.tarot-ask__count {
  text-align: right;
  font-size: 0.11rem;
  color: rgba(200, 168, 120, 0.4);
  margin: 0.06rem 0 0;
}

.tarot-ask__tip {
  margin: 0.12rem 0;
  font-size: 0.12rem;
  line-height: 1.6;
  color: rgba(200, 168, 120, 0.45);
  font-family: "Courier New", Courier, monospace;
}

.tarot-start-btn {
  display: inline-block;
  padding: 0.09rem 0.38rem;
  border: 0.02rem solid #c8a878;
  background: rgba(200, 168, 120, 0.12);
  color: #e8d8b8;
  font-family: "Ma Shan Zheng", cursive;
  font-size: 0.22rem;
  cursor: pointer;
  letter-spacing: 0.06rem;
}

.tarot-start-btn:disabled {
  opacity: 0.45;
  cursor: wait;
}

.tarot-start-btn--ghost {
  margin-top: 0;
  font-size: 0.18rem;
  background: transparent;
}

.tarot-error {
  margin-top: 0.12rem;
  color: #ff8080;
  font-size: 0.13rem;
}

.tarot-reading {
  display: flex;
  flex-direction: column;
  gap: 0.14rem;
}

.tarot-reading__question {
  text-align: left;
  padding: 0.08rem 0.1rem;
  border: 0.01rem solid rgba(200, 168, 120, 0.28);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.02rem;
}

.tarot-reading__q-label {
  display: block;
  font-size: 0.1rem;
  color: rgba(200, 168, 120, 0.9);
  letter-spacing: 0.02rem;
  margin-bottom: 0.04rem;
}

.tarot-reading__question p {
  margin: 0;
  font-size: 0.13rem;
  color: #f0ece4;
  line-height: 1.45;
  font-family: "Courier New", Courier, monospace;
}

.tarot-spread {
  display: flex;
  justify-content: space-between;
  gap: 0.06rem;
  align-items: stretch;
}

.tarot-spread--dealing .tarot-flip__inner {
  animation: tarotDeal 0.6s ease-in-out infinite alternate;
}

@keyframes tarotDeal {
  0% { transform: translateY(0); }
  100% { transform: translateY(-0.05rem); }
}

.tarot-slot {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.06rem;
}

.tarot-slot__pos {
  width: 100%;
  min-height: 0.26rem;
  margin: 0;
  padding: 0 0.02rem;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 0.1rem;
  color: rgba(200, 168, 120, 0.78);
  line-height: 1.35;
  text-align: center;
}

.tarot-flip {
  perspective: 700px;
  width: 100%;
  aspect-ratio: 2 / 3.2;
  max-width: 1.14rem;
  margin: 0 auto;
  flex-shrink: 0;
}

.tarot-flip__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.4, 0.2, 0.2, 1);
}

.tarot-flip--show .tarot-flip__inner {
  transform: rotateY(180deg);
}

.tarot-flip__img--rev {
  transform: rotate(180deg);
}

.tarot-flip__back,
.tarot-flip__front {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 0.05rem;
  border: 0.02rem solid #8a6848;
  overflow: hidden;
  box-sizing: border-box;
}

.tarot-flip__back {
  background: linear-gradient(145deg, #2a1838, #100818);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tarot-flip__moon {
  font-size: 0.32rem;
  color: rgba(200, 168, 120, 0.65);
}

.tarot-flip__front {
  transform: rotateY(180deg);
  background: #f5efe0;
}

.tarot-flip__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tarot-slot__info {
  width: 100%;
  margin-top: 0.02rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.04rem;
  text-align: center;
}

.tarot-slot__name {
  display: block;
  font-family: "Ma Shan Zheng", cursive;
  font-size: 0.15rem;
  color: #e8d8b8;
  font-weight: normal;
  line-height: 1.25;
}

.tarot-slot__ori {
  display: inline-block;
  margin-top: 0;
  font-size: 0.1rem;
  color: #c8a878;
  border: 0.01rem solid rgba(200, 168, 120, 0.45);
  padding: 0.01rem 0.06rem;
  border-radius: 0.02rem;
  line-height: 1.3;
}

.tarot-slot__ori--rev {
  color: #a88868;
}

.tarot-slot__meaning {
  margin: 0;
  padding: 0 0.02rem;
  font-size: 0.105rem;
  line-height: 1.4;
  color: rgba(232, 216, 184, 0.72);
  font-family: "Courier New", Courier, monospace;
}

.tarot-reading__actions {
  display: flex;
  justify-content: center;
  padding-top: 0.06rem;
}

.tarot-nav-link {
  display: block;
  margin: 0.35rem auto 0;
  padding: 0.06rem 0;
  background: none;
  border: none;
  color: rgba(255, 133, 56, 0.75);
  font-family: "Courier New", Courier, monospace;
  font-size: 0.14rem;
  cursor: pointer;
}
</style>
