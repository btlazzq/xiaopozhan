<template>
  <div
    v-if="visible"
    class="paper-fly-layer"
  >
    <div
      class="paper-fly"
      :class="phaseClass"
    >
      <div class="paper-fly__sheet">
        <div class="paper-fly__lines" />
        <p class="paper-fly__text">{{ text }}</p>
        <div class="paper-fly__fold paper-fly__fold--tl" />
        <div class="paper-fly__fold paper-fly__fold--tr" />
        <div class="paper-fly__fold paper-fly__fold--bl" />
      </div>
      <div class="paper-fly__ball">
        <span class="paper-fly__ball-inner" />
      </div>
      <div class="paper-fly__plane">
        <div class="paper-fly__plane-body" />
        <div class="paper-fly__plane-wing paper-fly__plane-wing--l" />
        <div class="paper-fly__plane-wing paper-fly__plane-wing--r" />
        <div class="paper-fly__plane-tail" />
        <div class="paper-fly__plane-crease" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  text: { type: String, default: "" },
});

const emit = defineEmits(["done"]);

const phaseClass = ref("");
let timers = [];

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function runAnimation() {
  clearTimers();
  phaseClass.value = "paper-fly--sheet";

  timers.push(setTimeout(() => { phaseClass.value = "paper-fly--crumple"; }, 100));
  timers.push(setTimeout(() => { phaseClass.value = "paper-fly--ball"; }, 580));
  timers.push(setTimeout(() => { phaseClass.value = "paper-fly--plane"; }, 920));
  timers.push(setTimeout(() => { phaseClass.value = "paper-fly--fly"; }, 1180));
  timers.push(setTimeout(() => {
    phaseClass.value = "";
    emit("done");
  }, 2600));
}

watch(
  () => props.visible,
  (val) => {
    if (val) runAnimation();
    else {
      clearTimers();
      phaseClass.value = "";
    }
  }
);

onBeforeUnmount(clearTimers);
</script>

<style scoped>
.paper-fly-layer {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-fly {
  position: relative;
  width: 3.1rem;
  height: 2.1rem;
}

.paper-fly__sheet,
.paper-fly__ball,
.paper-fly__plane {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.paper-fly__sheet {
  width: 2.8rem;
  height: 1.85rem;
  background: linear-gradient(165deg, #fffef8 0%, #f5efe0 45%, #ebe3d2 100%);
  border: 0.01rem solid rgba(80, 70, 55, 0.15);
  box-shadow:
    0 0.05rem 0.14rem rgba(0, 0, 0, 0.18),
    inset 0 0.01rem 0 rgba(255, 255, 255, 0.8);
  padding: 0.14rem 0.16rem;
  box-sizing: border-box;
  transform: translate(-50%, -50%) rotate(-1.5deg);
  overflow: hidden;
}

.paper-fly__lines {
  position: absolute;
  inset: 0.12rem 0.14rem;
  background: repeating-linear-gradient(
    transparent,
    transparent 0.26rem,
    rgba(120, 100, 80, 0.1) 0.27rem
  );
  pointer-events: none;
}

.paper-fly__text {
  position: relative;
  margin: 0;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.15rem;
  line-height: 1.5;
  color: #2a2420;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.paper-fly__fold {
  position: absolute;
  width: 0.35rem;
  height: 0.35rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.06), transparent);
  opacity: 0;
}

.paper-fly__fold--tl { top: 0; left: 0; clip-path: polygon(0 0, 100% 0, 0 100%); }
.paper-fly__fold--tr { top: 0; right: 0; clip-path: polygon(100% 0, 100% 100%, 0 0); }
.paper-fly__fold--bl { bottom: 0; left: 0; clip-path: polygon(0 100%, 100% 100%, 0 0); }

.paper-fly__ball {
  width: 0.55rem;
  height: 0.5rem;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.3);
}

.paper-fly__ball-inner {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 42% 58% 52% 48% / 48% 42% 58% 52%;
  background:
    radial-gradient(circle at 35% 30%, #fffef6, #e8dfd0 55%, #c8baa8 100%);
  box-shadow:
    inset -0.04rem -0.03rem 0.08rem rgba(0, 0, 0, 0.15),
    inset 0.03rem 0.02rem 0.06rem rgba(255, 255, 255, 0.6),
    0 0.04rem 0.1rem rgba(0, 0, 0, 0.25);
}

.paper-fly__plane {
  width: 0.9rem;
  height: 0.55rem;
  opacity: 0;
  transform: translate(-50%, -50%) rotate(-28deg) scale(0.4);
}

.paper-fly__plane-body {
  position: absolute;
  left: 18%;
  top: 28%;
  width: 64%;
  height: 38%;
  background: linear-gradient(180deg, #faf6ee 0%, #e8dfd0 100%);
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
  box-shadow: inset 0 0.02rem 0 rgba(255, 255, 255, 0.7);
}

.paper-fly__plane-wing {
  position: absolute;
  top: 18%;
  width: 48%;
  height: 72%;
  background: linear-gradient(160deg, #fffef8, #ddd4c4);
  border: 0.01rem solid rgba(80, 70, 55, 0.12);
}

.paper-fly__plane-wing--l {
  left: 0;
  clip-path: polygon(0 0, 100% 35%, 100% 100%, 0 70%);
  transform: skewY(-6deg);
}

.paper-fly__plane-wing--r {
  right: 0;
  clip-path: polygon(100% 0, 0 35%, 0 100%, 100% 70%);
  transform: skewY(6deg);
}

.paper-fly__plane-tail {
  position: absolute;
  left: 62%;
  top: 42%;
  width: 22%;
  height: 28%;
  background: #d8cfc0;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

.paper-fly__plane-crease {
  position: absolute;
  left: 22%;
  top: 38%;
  width: 56%;
  height: 0.015rem;
  background: rgba(100, 85, 65, 0.2);
  transform: rotate(-8deg);
}

/* phases */
.paper-fly--crumple .paper-fly__sheet {
  animation: sheetCrumple 0.48s ease-in forwards;
}

.paper-fly--crumple .paper-fly__fold {
  animation: foldIn 0.35s ease forwards;
}

.paper-fly--ball .paper-fly__sheet {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.05);
}

.paper-fly--ball .paper-fly__ball {
  opacity: 1;
  animation: ballSquish 0.32s ease-out forwards;
}

.paper-fly--plane .paper-fly__ball {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.1);
}

.paper-fly--plane .paper-fly__plane {
  opacity: 1;
  animation: planeUnfold 0.28s ease-out forwards;
}

.paper-fly--fly .paper-fly__plane {
  opacity: 1;
  animation: planeFlyAway 1.35s cubic-bezier(0.25, 0.55, 0.35, 1) forwards;
}

@keyframes sheetCrumple {
  0% { transform: translate(-50%, -50%) rotate(-1.5deg) scale(1); border-radius: 0; }
  35% { transform: translate(-50%, -50%) rotate(6deg) scale(0.78, 0.72); border-radius: 0.06rem; }
  70% { transform: translate(-50%, -50%) rotate(18deg) scale(0.42, 0.38); border-radius: 0.2rem; }
  100% { transform: translate(-50%, -50%) rotate(28deg) scale(0.22, 0.2); border-radius: 50%; opacity: 0.2; }
}

@keyframes foldIn {
  to { opacity: 0.85; }
}

@keyframes ballSquish {
  0% { transform: translate(-50%, -50%) scale(0.25); }
  50% { transform: translate(-50%, -50%) scale(1.08, 0.92); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes planeUnfold {
  0% { transform: translate(-50%, -50%) rotate(-10deg) scale(0.25); opacity: 0; }
  100% { transform: translate(-50%, -50%) rotate(-28deg) scale(1); opacity: 1; }
}

@keyframes planeFlyAway {
  0% {
    transform: translate(-50%, -50%) rotate(-28deg) scale(1);
    opacity: 1;
  }
  15% {
    transform: translate(-30%, -58%) rotate(-22deg) scale(1.05);
  }
  100% {
    transform: translate(3.5rem, -5rem) rotate(-12deg) scale(0.65);
    opacity: 0;
  }
}
</style>
